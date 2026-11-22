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
  paginate
} from "@statsify/discord";
import { Image, loadImage } from "skia-canvas";
import { createCanvas } from "@statsify/rendering";
import type { Skin } from "@statsify/schemas";

// 46x22 and HD capes use the 64x32 layout scaled by the smallest power of two that fits
function getCapeFront(cape: Image) {
  let scale = 1;
  while (64 * scale < cape.width || 32 * scale < cape.height) scale *= 2;

  return { x: scale, y: scale, width: 10 * scale, height: 16 * scale };
}

@Command({ description: (t) => t("commands.cape"), args: [MojangPlayerArgument] })
export class CapeCommand {
  public constructor(private readonly apiService: ApiService) {}

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

    const pages = capes.flatMap(({ label, image }) =>
      image ? [{ label, generator: () => this.renderCape(image) }] : []
    );

    if (pages.length === 0)
      return new ErrorMessage(
        (t) => t("errors.noCape.title"),
        (t) => t("errors.noCape.description", { username: player.username })
      );

    return paginate(context, pages);
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
    const image = player.capeUrl ?
      await loadImage(player.capeUrl).catch(() => null) :
      null;

    return { label: "Mojang", image };
  }

  private renderCape(cape: Image) {
    const front = getCapeFront(cape);
    const canvas = createCanvas(640, 1024);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      cape,
      front.x,
      front.y,
      front.width,
      front.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas;
  }
}
