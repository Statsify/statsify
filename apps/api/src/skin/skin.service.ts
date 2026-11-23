/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HttpService } from "@nestjs/axios";
import type { Image } from "skia-canvas";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PlayerNotFoundException } from "@statsify/api-client";
import { PlayerService } from "#player";
import { Skin } from "@statsify/schemas";
import { catchError, lastValueFrom, map } from "rxjs";
import { createCanvas, loadImage } from "@statsify/rendering";
import { getMinecraftTexturePath } from "@statsify/assets";
import { isUuid, normalizeUuid } from "@statsify/util";
import { renderSkin } from "@statsify/skin-renderer";
import type { ReturnModelType } from "@typegoose/typegoose";

/**
 * Whether a player without a skin gets Alex rather than Steve, by the rule before 1.19.3 added seven more defaults:
 * `UUID.hashCode() & 1`, the XOR of the last hex digit of each of the UUID's four 32-bit words.
 */
const isAlex = (uuid: string) =>
  ((Number.parseInt(uuid[7], 16) ^ Number.parseInt(uuid[15], 16) ^ Number.parseInt(uuid[23], 16) ^ Number.parseInt(uuid[31], 16)) & 1) === 1;

const defaultTexture = (alex: boolean) => getMinecraftTexturePath(`textures/entity/${alex ? "alex" : "steve"}.png`);

/** The skin at `skinUrl`, or Steve or Alex (slim) for a player without one. */
async function resolveSkin(uuid: string, skinUrl?: string, slim = false): Promise<{ skin: Image; slim: boolean }> {
  if (skinUrl) return { skin: await loadImage(skinUrl), slim };

  const alex = isAlex(normalizeUuid(uuid));
  return { skin: await loadImage(defaultTexture(alex)), slim: alex };
}

/** A skin's face with its hat layer, `size` px square, unsmoothed. */
function drawHead(skin: Image, size: number): Promise<Buffer> {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);

  ctx.drawImage(skin, 8, 8, 8, 8, 0, 0, size, size);
  ctx.drawImage(skin, 40, 8, 8, 8, 0, 0, size, size);

  return canvas.toBuffer("png");
}

/** A skin's texture as uploaded, or Steve's or Alex's, and whether its arms are slim, as the bot's render draws them. */
async function textureOf(uuid: string, skin: Skin | null): Promise<{ texture: Buffer; slim: boolean }> {
  const { skin: image, slim } = await resolveSkin(uuid, skin?.skinUrl, skin?.slim);
  // This field is set by loadImage from `@statsify/rendering`
  const { _data: texture } = image as unknown as { _data: Buffer };
  return { texture, slim };
}

async function renderOf(uuid: string, skin: Skin | null, extruded: boolean): Promise<Buffer> {
  const { texture, slim } = await textureOf(uuid, skin);
  return renderSkin(texture, slim, extruded);
}

@Injectable()
export class SkinService {
  public constructor(
    private readonly httpService: HttpService,
    private readonly playerService: PlayerService,
    @InjectModel(Skin) private readonly skinModel: ReturnModelType<typeof Skin>
  ) {}

  public async getHead(uuid: string, size: number): Promise<Buffer> {
    const { skin } = await this.getSkin(uuid)
      .then((skin) => resolveSkin(uuid, skin?.skinUrl, skin?.slim))
      .catch(() => resolveSkin(uuid));

    return drawHead(skin, size);
  }

  /**
   * The face of the skin stored for a player however old it is, or Steve's or Alex's: never asks Minecraft's session
   * server, so the site's traffic doesn't spend its rate limit.
   */
  public async getStoredHead(uuid: string, size: number): Promise<Buffer> {
    const stored = await this.getStoredSkin(uuid);
    const { skin } = await resolveSkin(uuid, stored?.skinUrl, stored?.slim);
    return drawHead(skin, size);
  }

  public async getRender(uuid: string, extruded: boolean): Promise<Buffer> {
    return renderOf(uuid, await this.getSkin(uuid), extruded);
  }

  /** A render of the stored skin, like `getStoredHead`. */
  public async getStoredRender(uuid: string): Promise<Buffer> {
    return renderOf(uuid, await this.getStoredSkin(uuid), false);
  }

  /** The stored skin's texture, like `getStoredHead`, for the site's skin viewer to draw. */
  public async getStoredTexture(uuid: string): Promise<{ texture: Buffer; slim: boolean }> {
    return textureOf(uuid, await this.getStoredSkin(uuid));
  }

  public async getSkin(tag: string): Promise<Skin> {
    const isUsername = !isUuid(tag);
    const key = isUsername ? tag.toLowerCase() : normalizeUuid(tag);

    const cachedSkin = await this.skinModel
      .findOne()
      .where(isUsername ? "usernameToLower" : "uuid")
      .equals(key)
      .lean()
      .exec();

    if (cachedSkin && Date.now() < cachedSkin.expiresAt) {
      return cachedSkin;
    }

    const uuid = isUsername ? await this.playerService.getUuid(key) : key;

    const skin = await this.requestSkin(uuid).catch((error) => {
      if (cachedSkin) return cachedSkin;
      throw error;
    });

    // Cache for 3 hours
    skin.expiresAt = Date.now() + (1000 * 60 * 60 * 3);

    await this.skinModel.replaceOne({ uuid }, skin, { upsert: true }).lean().exec();

    return skin;
  }

  private getStoredSkin(uuid: string): Promise<Skin | null> {
    return this.skinModel.findOne().where("uuid").equals(normalizeUuid(uuid)).lean().exec();
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

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("isAlex", () => {
    it("matches the parity of Java's UUID.hashCode()", () => {
      expect(isAlex("069a79f444e94726a5befca90e38aaf5")).toBe(false);
      expect(isAlex("853c80ef3c3749fdaa49938b674adae6")).toBe(true);
      expect(isAlex("00000001000000010000000000000000")).toBe(false);
    });
  });
}
