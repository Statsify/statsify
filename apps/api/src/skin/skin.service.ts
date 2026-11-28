/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HttpService } from "@nestjs/axios";
import type { Image } from "skia-canvas";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PlayerNotFoundException } from "@statsify/api-client";
import { Redis } from "ioredis";
import { Skin } from "@statsify/schemas";
import { catchError, lastValueFrom, map } from "rxjs";
import { createCanvas, loadImage } from "@statsify/rendering";
import { getMinecraftTexturePath } from "@statsify/assets";
import { type Armor, type ArmorPiece, renderSkin } from "@statsify/skin-renderer";
import type { ArmorDto, ArmorPieceDto, SKULLS, SkinRenderDto } from "#dtos";
import type { ReturnModelType } from "@typegoose/typegoose";
import { readFile } from "node:fs/promises";

@Injectable()
export class SkinService {
  public constructor(
    private readonly httpService: HttpService,
    @InjectModel(Skin) private readonly skinModel: ReturnModelType<typeof Skin>,
    @InjectRedis() private readonly redis: Redis
  ) {}

  public async getHead(uuid: string, size: number): Promise<Buffer> {
    const { skin } = await this.getSkin(uuid)
      .then((skin) => this.resolveSkin(skin?.skinUrl, skin?.slim ?? false))
      .catch(() => this.resolveSkin(undefined, false));

    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);

    ctx.drawImage(skin, 8, 8, 8, 8, 0, 0, size, size);
    ctx.drawImage(skin, 40, 8, 8, 8, 0, 0, size, size);

    return canvas.toBuffer("png");
  }

  public async getRender(
    uuid: string,
    extruded: boolean,
    { yaw, pose, cape, armor = {} }: Omit<SkinRenderDto, "uuid">
  ): Promise<Buffer> {
    const enchanted = Object.values(armor).some((piece) => piece && "enchanted" in piece && piece.enchanted);

    const [skin, resolvedArmor, glint] = await Promise.all([
      this.getSkin(uuid),
      this.resolveArmor(armor),
      enchanted ? readFile(getMinecraftTexturePath("textures/misc/enchanted_item_glint.png")) : undefined,
    ]);

    const [{ skin: image }, capeImage] = await Promise.all([
      this.resolveSkin(skin.skinUrl, skin.slim),
      cape && skin.capeUrl ? loadTexture(skin.capeUrl) : undefined,
    ]);

    return renderSkin(imageData(image), skin.slim ?? false, extruded, {
      yaw,
      pose,
      armor: resolvedArmor,
      glint,
      cape: capeImage && imageData(capeImage),
    });
  }

  public async getSkin(tag: string): Promise<Skin> {
    tag = tag.replaceAll("-", "").toLowerCase();
    const isUsername = tag.length <= 16;

    const cachedSkin = await this.skinModel
      .findOne()
      .where(isUsername ? "usernameToLower" : "uuid")
      .equals(tag)
      .lean()
      .exec();

    if (cachedSkin && Date.now() < cachedSkin.expiresAt) {
      return cachedSkin;
    }

    const uuid = isUsername ? await this.getUuid(tag) : tag;

    const skin = await this.requestSkin(uuid).catch((error) => {
      if (cachedSkin) return cachedSkin;
      throw error;
    });

    // Cache for 3 hours
    skin.expiresAt = Date.now() + (1000 * 60 * 60 * 3);

    await this.skinModel.replaceOne({ uuid }, skin, { upsert: true }).lean().exec();

    return skin;
  }

  private async resolveSkin(
    skinUrl?: string,
    slim?: boolean
  ): Promise<{ skin: Image; slim: boolean }> {
    if (!skinUrl) {
      return this.resolveSkin(
        getMinecraftTexturePath("textures/entity/steve.png"),
        false
      );
    }

    const skin = await loadImage(skinUrl);

    return {
      skin,
      slim: slim ?? false,
    };
  }

  private async resolveArmor(armor: ArmorDto): Promise<Armor> {
    const [helmet, chestplate, leggings, boots] = await Promise.all([
      this.resolveHelmet(armor.helmet),
      armor.chestplate && resolveArmorPiece(armor.chestplate, 1),
      armor.leggings && resolveArmorPiece(armor.leggings, 2),
      armor.boots && resolveArmorPiece(armor.boots, 1),
    ]);

    return { helmet, chestplate, leggings, boots };
  }

  private async resolveHelmet(helmet: ArmorDto["helmet"]): Promise<ArmorPiece | undefined> {
    if (!helmet) return;
    if (helmet.head !== undefined) return this.resolveHead(helmet.head);

    // 1.8 draws no glint on a worn skull or player head
    if (helmet.skull !== undefined) {
      const texture = await readFile(getMinecraftTexturePath(`textures/entity/${SKULL_TEXTURES[helmet.skull]}.png`));
      return { texture, enchanted: false, skull: true };
    }

    return resolveArmorPiece(helmet, 1);
  }

  private async resolveHead(hash: string): Promise<ArmorPiece> {
    const key = `head:${hash}`;
    let head = await this.redis.getBuffer(key);

    if (!head) {
      head = imageData(await loadTexture(`https://textures.minecraft.net/texture/${hash}`));

      // The hash pins the image, so this expiry only bounds how many heads Redis keeps
      await this.redis.set(key, head, "EX", 60 * 60 * 24 * 30);
    }

    return { texture: head, enchanted: false, skull: true };
  }

  private getUuid(username: string): Promise<string> {
    return lastValueFrom(
      this.httpService.get(`https://api.mojang.com/users/profiles/minecraft/${username}`).pipe(
        map((response) => response.data as MojangProfile),
        map((data) => data.id),
        catchError((error) => {
          if (error.response.status === 404) throw new PlayerNotFoundException();
          // Ratelimited
          if (error.response.status === 429) throw new InternalServerErrorException();

          // Unknown
          throw new InternalServerErrorException();
        })
      )
    );
  }

  private requestSkin(uuid: string) {
    return lastValueFrom(
      this.httpService.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`).pipe(
        map((response) => {
          if (response.status !== 200) throw response;
          return response.data;
        }),
        map((data) => new Skin(data)),
        catchError((error) => {
          // Player not found
          if (error.status === 204) throw new PlayerNotFoundException();
          throw new InternalServerErrorException();
        })
      )
    );
  }
}

// This field is set by loadImage from `@statsify/rendering`
const imageData = (image: Image) => {
  const { _data: data } = image as unknown as { _data: Buffer };
  return data;
};

const loadTexture = (url: string) =>
  loadImage(url).catch((error) => {
    if (error.response?.status === 404) throw new NotFoundException("texture");
    throw error;
  });

const SKULL_TEXTURES: Record<(typeof SKULLS)[number], string> = {
  skeleton: "skeleton/skeleton",
  wither_skeleton: "skeleton/wither_skeleton",
  zombie: "zombie/zombie",
  creeper: "creeper/creeper",
};

const UNDYED_LEATHER = 0xA0_65_40;

async function resolveArmorPiece(
  { material, color = UNDYED_LEATHER, enchanted = false }: ArmorPieceDto,
  layer: 1 | 2
): Promise<ArmorPiece> {
  const path = getMinecraftTexturePath(`textures/models/armor/${material}_layer_${layer}`);
  if (material !== "leather") return { texture: await readFile(`${path}.png`), enchanted };

  // The dye tints the base, then the overlay adds the undyed details
  const [base, overlay] = await Promise.all([
    loadImage(`${path}.png`),
    loadImage(`${path}_overlay.png`),
  ]);
  const canvas = createCanvas(base.width, base.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(base, 0, 0);

  const pixels = ctx.getImageData(0, 0, base.width, base.height);
  const dye = [(color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF];

  for (let i = 0; i < pixels.data.length; i += 4) {
    for (let channel = 0; channel < 3; channel++) {
      pixels.data[i + channel] = Math.floor((pixels.data[i + channel] * dye[channel]) / 255);
    }
  }

  ctx.putImageData(pixels, 0, 0);
  ctx.drawImage(overlay, 0, 0);

  return { texture: await canvas.toBuffer("png"), enchanted };
}

interface MojangProfile {
  id: string;
  name: string;
  legacy?: true;
  demo?: true;
}
