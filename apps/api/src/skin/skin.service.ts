/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Canvas, type Image } from "skia-canvas";
import { HttpService } from "@nestjs/axios";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PlayerNotFoundException } from "@statsify/api-client";
import { Skin } from "@statsify/schemas";
import { catchError, lastValueFrom, map } from "rxjs";
import { getMinecraftTexturePath } from "@statsify/assets";
import { loadImage } from "@statsify/rendering";
import { renderSkin } from "@statsify/skin-renderer";
import type { ReturnModelType } from "@typegoose/typegoose";

@Injectable()
export class SkinService {
  public constructor(
    private readonly httpService: HttpService,
    @InjectModel(Skin) private readonly skinModel: ReturnModelType<typeof Skin>
  ) {}

  public async getHead(uuid: string, size: number): Promise<Buffer> {
    const { skin } = await this.getSkin(uuid).then(skin => this.resolveSkin(skin.skinUrl, skin.slim ?? false));

    const canvas = new Canvas(size, size);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);

    ctx.drawImage(skin, 8, 8, 8, 8, 0, 0, size, size);
    ctx.drawImage(skin, 40, 8, 8, 8, 0, 0, size, size);

    return canvas.toBuffer("png");
  }

  public async getRender(uuid: string): Promise<Buffer> {
    const skin = await this.getSkin(uuid);
    return renderSkin(skin.skinUrl, skin.slim ?? false);
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
    const skin = await this.requestSkin(uuid);

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

interface MojangProfile {
  id: string;
  name: string;
  legacy?: true;
  demo?: true;
}