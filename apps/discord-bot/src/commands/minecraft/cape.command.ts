/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiService,
  Command,
  CommandContext,
  ErrorMessage,
  MojangPlayerArgument,
  PaginateService,
} from "@statsify/discord";
import { Canvas, Image, loadImage } from "skia-canvas";
import type { Skin } from "@statsify/schemas";

@Command({ description: (t) => t("commands.cape"), args: [MojangPlayerArgument] })
export class CapeCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.apiService.getPlayerSkinTextures(
      context.option<string>("player"),
      user
    );

    const capes = await Promise.all([
      this.getOptifineCape(player.username),
      this.getMojangCape(player),
    ]);

    const pages = capes
      .filter((c) => !!c.image)
      .map((c) => ({
        label: c.label,
        generator: () => this.renderCape(c.image as Image),
      }));

    if (!pages.length)
      return new ErrorMessage(
        (t) => t("errors.noCape.title"),
        (t) => t("errors.noCape.description", { username: player.username })
      );

    return this.paginateService.paginate(context, pages);
  }

  private async getOptifineCape(username: string) {
    return {
      label: "Optifine",
      image: await loadImage(`http://s.optifine.net/capes/${username}.png`).catch(
        () => null
      ),
    };
  }

  private async getMojangCape(player: Skin) {
    const image = player.capeUrl
      ? await loadImage(player.capeUrl).catch(() => null)
      : null;

    return { label: "Mojang", image };
  }

  private renderCape(cape: Image) {
    const canvas = new Canvas(636, 1024);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    let height: number;
    let width: number;
    let start: number;

    switch (cape.width) {
      case 92:
        height = 32;
        width = 20;
        start = 2;
        break;

      case 184:
        height = 64;
        width = 40;
        start = 4;
        break;

      case 1024:
        height = 256;
        width = 160;
        start = 16;
        break;

      case 2048:
        height = 512;
        width = 318;
        start = 12;
        break;

      default:
      case 46:
        height = 16;
        width = 10;
        start = 1;
        break;
    }

    const ratio = Math.round(Math.min(canvas.width / width, canvas.height / height));

    ctx.drawImage(
      cape,
      start,
      start,
      cape.width,
      cape.height,
      0,
      0,
      cape.width * ratio,
      cape.height * ratio
    );

    return canvas;
  }
}
