/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiException } from "../exception.ts";
import { Canvas, Image, loadImage } from "skia-canvas";
import { Hono } from "hono";
import { Permissions, Policy, auth } from "../auth.ts";
import { Skin } from "@statsify/schemas";
import { UuidSchema, validator } from "../validation.ts";
import { getMinecraftTexturePath } from "@statsify/assets";
import { getModelForClass } from "@typegoose/typegoose";
import { renderSkin } from "@statsify/skin-renderer";
import { z } from "zod";

const SkinModel = getModelForClass(Skin);

const SkinNotFoundException = new ApiException(404, ["Skin Not Found"]);
const MojangInternalException = new ApiException(500, ["Mojang API Failure"]);

export const skinsRouter = new Hono()
// Get Player Render
  .get(
    "/",
    auth({ policy: Policy.has(Permissions.SkinRead) }),
    validator("query", z.object({ uuid: UuidSchema })),
    async (c) => {
      const { uuid } = c.req.valid("query");
      const { texture, slim } = await getSkinTexture(uuid);

      // @ts-expect-error _data is a property set by our custom loadImage function
      const buffer = texture["_data"] as Buffer;

      c.header("Content-Type", "image/png");

      const render = await renderSkin(buffer, slim);
      return c.body(render);
    })
// Get Player Texture Information
  .get(
    "/textures",
    auth({ policy: Policy.has(Permissions.SkinRead) }),
    validator("query", z.object({ uuid: UuidSchema })),
    async (c) => {
      const { uuid } = c.req.valid("query");
      const skin = await getSkinTextureData(uuid);
      return c.json({ success: true, skin });
    })
// Get Player Head
  .get(
    "/head",
    auth({ policy: Policy.has(Permissions.SkinRead) }),
    validator("query", z.object({
      uuid: UuidSchema,
      size: z
        .coerce
        .number()
        .multipleOf(8)
        .min(8)
        .max(160)
        .default(8),
    })),
    async (c) => {
      const { uuid, size } = c.req.valid("query");
      const { texture } = await getSkinTexture(uuid);

      const canvas = new Canvas(size, size);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, size, size);

      ctx.drawImage(texture, 8, 8, 8, 8, 0, 0, size, size);
      ctx.drawImage(texture, 40, 8, 8, 8, 0, 0, size, size);

      c.header("Content-Type", "image/png");

      const buffer = await canvas.toBuffer("png");
      return c.body(buffer);
    });

async function getSkinTextureData(uuid: string) {
  const cachedSkinData = await SkinModel
    .findOne()
    .where("uuid")
    .equals(uuid)
    .lean()
    .exec();

  if (cachedSkinData && Date.now() < cachedSkinData.expiresAt) {
    return cachedSkinData;
  }

  const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);

  if (response.status === 204) throw SkinNotFoundException;
  if (response.status !== 200) throw MojangInternalException;

  let skin: Skin;

  try {
    const body = await response.json();
    skin = new Skin(body);
  } catch (error) {
    // TODO: improve logging
    console.error(error);
    if (cachedSkinData) return cachedSkinData;
    throw MojangInternalException;
  }

  // Cache for 3 hours
  skin.expiresAt = Date.now() + (1000 * 60 * 60 * 3);

  await SkinModel
    .replaceOne({ uuid }, skin, { upsert: true })
    .lean()
    .exec();

  return skin;
}
async function getSkinTexture(uuid: string): Promise<{ texture: Image; slim: boolean }> {
  try {
    const skin = await getSkinTextureData(uuid);
    const texture = await loadImage(skin.skinUrl);
    return { texture, slim: skin.slim ?? false };
  } catch {
    const texture = await loadImage(getMinecraftTexturePath("textures/entity/steve.png"));
    return { texture, slim: false };
  }
}

// /**
//  * Copyright (c) Statsify
//  *
//  * This source code is licensed under the GNU GPL v3 license found in the
//  * LICENSE file in the root directory of this source tree.
//  * https://github.com/Statsify/statsify/blob/main/LICENSE
//  */

// import { Canvas, type Image } from "skia-canvas";
// import { HttpService } from "@nestjs/axios";
// import { InjectModel } from "@m8a/nestjs-typegoose";
// import { Injectable, InternalServerErrorException } from "@nestjs/common";
// import { PlayerNotFoundException } from "@statsify/api-client";
// import { Skin } from "@statsify/schemas";
// import { catchError, lastValueFrom, map } from "rxjs";
// import { getMinecraftTexturePath } from "@statsify/assets";
// import { loadImage } from "@statsify/rendering";
// import { renderSkin } from "@statsify/skin-renderer";
// import type { ReturnModelType } from "@typegoose/typegoose";

// @Injectable()
// export class SkinService {
//   public constructor(
//     private readonly httpService: HttpService,
//     @InjectModel(Skin) private readonly skinModel: ReturnModelType<typeof Skin>
//   ) {}

//   public async getHead(uuid: string, size: number): Promise<Buffer> {
//     const { skin } = await this.getSkin(uuid)
//       .then((skin) => this.resolveSkin(skin?.skinUrl, skin?.slim ?? false))
//       .catch(() => this.resolveSkin(undefined, false));

//     const canvas = new Canvas(size, size);
//     const ctx = canvas.getContext("2d");
//     ctx.imageSmoothingEnabled = false;

//     ctx.fillStyle = "#000";
//     ctx.fillRect(0, 0, size, size);

//     ctx.drawImage(skin, 8, 8, 8, 8, 0, 0, size, size);
//     ctx.drawImage(skin, 40, 8, 8, 8, 0, 0, size, size);

//     return canvas.toBuffer("png");
//   }

//   public async getRender(uuid: string): Promise<Buffer> {
//     const data = await this.getSkin(uuid).catch(() => undefined);
//     const { skin, slim } = await this.resolveSkin(data?.skinUrl, data?.slim ?? false);
//     // @ts-expect-error _data is a property set by our custom loadImage function
//     const buffer = skin["_data"] as Buffer;
//     return renderSkin(buffer, slim);
//   }

//   public async getSkin(tag: string): Promise<Skin> {
//     tag = tag.replaceAll("-", "").toLowerCase();
//     const isUsername = tag.length <= 16;

//     const cachedSkin = await this.skinModel
//       .findOne()
//       .where(isUsername ? "usernameToLower" : "uuid")
//       .equals(tag)
//       .lean()
//       .exec();

//     if (cachedSkin && Date.now() < cachedSkin.expiresAt) {
//       return cachedSkin;
//     }

//     const uuid = isUsername ? await this.getUuid(tag) : tag;

//     const skin = await this.requestSkin(uuid).catch((error) => {
//       if (cachedSkin) return cachedSkin;
//       throw error;
//     });

//     // Cache for 3 hours
//     skin.expiresAt = Date.now() + (1000 * 60 * 60 * 3);

//     await this.skinModel.replaceOne({ uuid }, skin, { upsert: true }).lean().exec();

//     return skin;
//   }

//   private async resolveSkin(
//     skinUrl?: string,
//     slim?: boolean
//   ): Promise<{ skin: Image; slim: boolean }> {
//     if (!skinUrl) {
//       return this.resolveSkin(
//         getMinecraftTexturePath("textures/entity/steve.png"),
//         false
//       );
//     }

//     const skin = await loadImage(skinUrl);

//     return {
//       skin,
//       slim: slim ?? false,
//     };
//   }

//   private getUuid(username: string): Promise<string> {
//     return lastValueFrom(
//       this.httpService.get(`https://api.mojang.com/users/profiles/minecraft/${username}`).pipe(
//         map((response) => response.data as MojangProfile),
//         map((data) => data.id),
//         catchError((error) => {
//           if (error.response.status === 404) throw new PlayerNotFoundException();
//           // Ratelimited
//           if (error.response.status === 429) throw new InternalServerErrorException();

//           // Unknown
//           throw new InternalServerErrorException();
//         })
//       )
//     );
//   }

//   private requestSkin(uuid: string) {
//     return lastValueFrom(
//       this.httpService.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`).pipe(
//         map((response) => {
//           if (response.status !== 200) throw response;
//           return response.data;
//         }),
//         map((data) => new Skin(data)),
//         catchError((error) => {
//           // Player not found
//           if (error.status === 204) throw new PlayerNotFoundException();
//           throw new InternalServerErrorException();
//         })
//       )
//     );
//   }
// }

// interface MojangProfile {
//   id: string;
//   name: string;
//   legacy?: true;
//   demo?: true;
// }

