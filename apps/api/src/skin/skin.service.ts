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
import { BadRequestException, Injectable, InternalServerErrorException, ServiceUnavailableException } from "@nestjs/common";
import { LRUCache } from "lru-cache";
import { PlayerNotFoundException } from "@statsify/api-client";
import { Skin } from "@statsify/schemas";
import { catchError, lastValueFrom, map } from "rxjs";
import { createCanvas, loadImage } from "@statsify/rendering";
import { getAssetPath, getMinecraftTexturePath } from "@statsify/assets";
import { getHelmetModel, getKartModel, parseSuitPiece } from "./kart-cosmetics.js";
import { join } from "node:path";
import {
  type Armor,
  type ArmorPiece,
  type ModelInstance,
  ModelLibrary,
  renderScene,
  renderSkin,
} from "@statsify/skin-renderer";
import { type ArmorDto, type ArmorPieceDto, KART_CAMERA, type KartRenderDto, type SKULLS, type SkinRenderDto } from "#dtos";
import type { ReturnModelType } from "@typegoose/typegoose";
import { readFile, readdir } from "node:fs/promises";

// A texture hash always serves the same image, so heads never need refetching
const HEAD_CACHE_SIZE = 500;

@Injectable()
export class SkinService {
  private readonly heads = new LRUCache<string, Buffer>({ max: HEAD_CACHE_SIZE });
  private kartLibrary?: Promise<ModelLibrary>;

  public constructor(
    private readonly httpService: HttpService,
    @InjectModel(Skin) private readonly skinModel: ReturnModelType<typeof Skin>
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
    const [skin, resolvedArmor] = await Promise.all([this.getSkin(uuid), this.resolveArmor(armor)]);

    const [{ skin: image }, capeImage] = await Promise.all([
      this.resolveSkin(skin.skinUrl, skin.slim),
      cape && skin.capeUrl ? loadImage(skin.capeUrl).catch(() => undefined) : undefined,
    ]);

    const enchanted = Object.values(resolvedArmor).some((piece) => piece?.enchanted);

    return renderSkin(imageData(image), skin.slim ?? false, extruded, {
      yaw,
      pose,
      armor: resolvedArmor,
      glint: enchanted ? await readFile(getMinecraftTexturePath("textures/misc/enchanted_item_glint.png")) : undefined,
      cape: capeImage && imageData(capeImage),
    });
  }

  public async getKartRender({ uuid, ...options }: KartRenderDto): Promise<Buffer> {
    const kart = resolveKart(options, uuid !== undefined);

    const [library, player] = await Promise.all([
      this.getKartLibrary(),
      uuid ? this.getSkin(uuid).then((skin) => this.resolveSkin(skin.skinUrl, skin.slim)) : undefined,
    ]);

    return renderKart(library, kart, {
      ...options,
      player: player && { skin: imageData(player.skin), slim: player.slim },
    }).catch((error) => {
      // The library only finds a missing file when a scene bakes it, so a pack completed after startup needs a reload
      if (error instanceof ServiceUnavailableException) this.kartLibrary = undefined;
      throw error;
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
    if ("head" in helmet) return this.resolveHead(helmet.head);

    // 1.8 draws no glint on a worn skull or player head
    if ("skull" in helmet) {
      const texture = await readFile(getMinecraftTexturePath(`textures/entity/${SKULL_TEXTURES[helmet.skull]}.png`));
      return { texture, enchanted: false, skull: true };
    }

    return resolveArmorPiece(helmet, 1);
  }

  private async resolveHead(hash: string): Promise<ArmorPiece | undefined> {
    const head = this.heads.get(hash) ??
      await loadImage(`https://textures.minecraft.net/texture/${hash}`).then(imageData).catch(() => undefined);

    if (!head) return;

    this.heads.set(hash, head);

    return { texture: head, enchanted: false, skull: true };
  }

  // Forgets a failed load, so a pack copied in after startup is picked up without a restart
  private getKartLibrary() {
    this.kartLibrary ??= loadKartLibrary().catch((error) => {
      this.kartLibrary = undefined;
      throw error;
    });

    return this.kartLibrary;
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

const SKULL_TEXTURES: Record<(typeof SKULLS)[number], string> = {
  skeleton: "skeleton/skeleton",
  wither_skeleton: "skeleton/wither_skeleton",
  zombie: "zombie/zombie",
  creeper: "creeper/creeper",
};

const UNDYED_LEATHER = 0xA0_65_40;

async function resolveArmorPiece(
  { material, color = UNDYED_LEATHER, enchanted = false }: ArmorPieceDto,
  layer: 1 | 2,
  textures = getMinecraftTexturePath("textures")
): Promise<ArmorPiece> {
  const path = join(textures, `models/armor/${material}_layer_${layer}`);
  if (material !== "leather") return { texture: await readFile(`${path}.png`), enchanted };

  // The dye tints the base, then the overlay adds the undyed details
  const [base, overlay] = await Promise.all([loadImage(`${path}.png`), loadImage(`${path}_overlay.png`)]);
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

// Hypixel's pack listing doesn't carry the Turbo Kart Racers pack, so it's copied in by hand
const KART_PACK = join(getAssetPath("resource-packs/turbo-kart-racers", "public"), "assets/minecraft");

// The kart is worn by an armor stand the rider sits on: the stand's mounted offset (1.975 × 0.75 blocks)
// less the player's riding offset (0.35), in pixels
const KART_MOUNT = -(1.975 * 0.75 - 0.35) * 16;

async function readPackFiles<T>(folder: string, extension: string, read: (path: string) => Promise<T>) {
  const files = (await readdir(join(KART_PACK, folder), { recursive: true })).filter((file) => file.endsWith(extension));
  const contents = await Promise.all(files.map((file) => read(join(KART_PACK, folder, file))));
  return Object.fromEntries(files.map((file, index) => [file.slice(0, -extension.length), contents[index]]));
}

const throwPackUnavailable = (): never => {
  throw new ServiceUnavailableException("The Turbo Kart Racers pack isn't installed");
};

// The renderer's errors carry only a message
const MISSING_PACK_FILE = /^SkinRendererError: The pack has no (model|texture) named /;

const rethrowPackError = (error: unknown): never => {
  if (error instanceof Error && MISSING_PACK_FILE.test(error.message)) throwPackUnavailable();
  throw error;
};

export async function loadKartLibrary(): Promise<ModelLibrary> {
  const [models, textures, mcmeta] = await Promise.all([
    readPackFiles("models", ".json", (path) => readFile(path, "utf8")),
    readPackFiles("textures", ".png", (path) => readFile(path)),
    readPackFiles("textures", ".png.mcmeta", (path) => readFile(path, "utf8")),
  ]).catch(throwPackUnavailable);

  return new ModelLibrary({ models, textures, mcmeta });
}

export interface KartScene {
  models: ModelInstance[];
  suit: Omit<ArmorDto, "helmet">;
}

export function resolveKart(
  { kart, helmet, jacket, pants, shoes }: Pick<KartRenderDto, "kart" | "helmet" | "jacket" | "pants" | "shoes">,
  seated: boolean
): KartScene {
  const models: ModelInstance[] = [
    { model: getKartModel(kart), bone: "root", display: "head", translation: [0, KART_MOUNT, 0] },
  ];

  const helmetModel = getHelmetModel(helmet);
  if (helmetModel) models.push({ model: helmetModel, bone: "head", display: "head" });

  const suit = {
    chestplate: parseSuitPiece(jacket, "JACKET"),
    leggings: parseSuitPiece(pants, "PANTS"),
    boots: parseSuitPiece(shoes, "SHOES"),
  };

  if (!seated && (helmetModel || Object.values(suit).some(Boolean))) {
    throw new BadRequestException("A helmet or suit needs a uuid to wear it");
  }

  return { models, suit };
}

export interface KartRenderOptions extends Pick<KartRenderDto, "extruded" | "width" | "height" | "yaw" | "pitch"> {
  player?: { skin: Uint8Array; slim: boolean };
}

async function resolvePackArmor(pack: string, pieces: Omit<ArmorDto, "helmet">): Promise<Armor> {
  const textures = join(pack, "textures");
  const [chestplate, leggings, boots] = await Promise.all([
    pieces.chestplate && resolveArmorPiece(pieces.chestplate, 1, textures),
    pieces.leggings && resolveArmorPiece(pieces.leggings, 2, textures),
    pieces.boots && resolveArmorPiece(pieces.boots, 1, textures),
  ]).catch(throwPackUnavailable);

  return { chestplate, leggings, boots };
}

export async function renderKart(
  library: ModelLibrary,
  { models, suit }: KartScene,
  {
    player,
    extruded = false,
    width = KART_CAMERA.width,
    height = KART_CAMERA.height,
    yaw = KART_CAMERA.yaw,
    pitch = KART_CAMERA.pitch,
  }: KartRenderOptions
): Promise<Buffer> {
  const output = { width, height, yaw, pitch };

  if (!player) return renderScene(library, { models }, output).catch(rethrowPackError);

  const armor = await resolvePackArmor(KART_PACK, suit);

  return renderScene(library, { player: { ...player, extruded, armor, pose: "sit" }, models }, output)
    .catch(rethrowPackError);
}

interface MojangProfile {
  id: string;
  name: string;
  legacy?: true;
  demo?: true;
}
