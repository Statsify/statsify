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
import { getMinecraftTexturePath, importAsset } from "@statsify/assets";
import { loadImage } from "@statsify/rendering";
import type { ReturnModelType } from "@typegoose/typegoose";

@Injectable()
export class SkinService {
  private skinRenderer: ((skin: Image, slim: boolean) => Promise<Buffer>) | null;

  public constructor(
    private readonly httpService: HttpService,
    @InjectModel(Skin) private readonly skinModel: ReturnModelType<typeof Skin>
  ) {}

  public async getHead(uuid: string, size: number): Promise<Buffer> {
    const { skin } = await this.getSkin(uuid);

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
    const { skin, slim } = await this.getSkin(uuid);

    const renderer = await this.getSkinRenderer();

    if (!renderer) {
      const canvas = new Canvas(380, 640);
      const ctx = canvas.getContext("2d");

      const skin = await loadImage(`https://crafatar.com/renders/body/${uuid}?overlay`);

      const scale = 2;
      const width = skin.width * scale;
      const height = skin.height * scale;

      ctx.drawImage(
        skin,
        (canvas.width - width) / 2,
        (canvas.height - height) / 2,
        width,
        height
      );

      return canvas.toBuffer("png");
    }

    return renderer(skin, slim);
  }

  public async getSkin(uuid: string) {
    uuid = uuid.replaceAll("-", "");

    const skin = await this.skinModel.findOne().where("uuid").equals(uuid).lean().exec();

    if (skin && Date.now() < skin.expiresAt) {
      return this.resolveSkin(skin.skinUrl, skin.slim);
    }

    const skinData = await this.requestSkin(uuid);

    //Possibly the service is down or we are ratelimited
    if (!skinData) {
      return this.resolveSkin(skin?.skinUrl, skin?.slim);
    }

    //Cache for  6 hours
    skinData.expiresAt = Date.now() + 2.16e7;

    await this.skinModel.replaceOne({ uuid }, skinData, { upsert: true }).lean().exec();

    return this.resolveSkin(skinData.skinUrl, skinData.slim);
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

  private async getSkinRenderer() {
    if (this.skinRenderer) return this.skinRenderer;

    const renderer = await importAsset<any>("skin-renderer");

    if (!renderer) return null;

    this.skinRenderer = renderer.renderSkin;

    return this.skinRenderer;
  }
}
