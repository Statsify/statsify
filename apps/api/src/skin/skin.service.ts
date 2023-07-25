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
import { Injectable } from "@nestjs/common";
import { Skin } from "@statsify/schemas";
import { catchError, lastValueFrom, map, of } from "rxjs";
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
    const { skin } = await this.getSkin(uuid).then(skin => this.resolveSkin(skin?.skinUrl, skin?.slim ?? false));

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
    return renderSkin(skin?.skinUrl, skin?.slim ?? false);
  }

  public async getSkin(uuid: string): Promise<Skin | undefined> {
    uuid = uuid.replaceAll("-", "");

    const skin = await this.skinModel.findOne().where("uuid").equals(uuid).lean().exec();

    if (skin && Date.now() < skin.expiresAt) {
      return skin;
    }

    const skinData = await this.requestSkin(uuid);

    //Possibly the service is down or we are ratelimited
    if (!skinData) return undefined;

    //Cache for  6 hours
    skinData.expiresAt = Date.now() + 2.16e7;

    await this.skinModel.replaceOne({ uuid }, skinData, { upsert: true }).lean().exec();

    return skinData;
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

  private async requestSkin(uuid: string) {
    return lastValueFrom(
      this.httpService.get(`/session/minecraft/profile/${uuid}`).pipe(
        map((data) => data.data),
        map((data) => new Skin(data)),
        catchError(() => of(null))
      )
    );
  }
}
