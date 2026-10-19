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

interface CapeFront {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Cape textures use the vanilla 64x32 layout, where the front is the 10x16 area at (1, 1).
 * Like OptiFine, other sizes (its 46x22 capes and HD capes) are read as that layout scaled
 * up by the smallest power of two that fits the texture.
 */
function getCapeFront(cape: Image): CapeFront | undefined {
  let scale = 1;
  while (64 * scale < cape.width || 32 * scale < cape.height) scale *= 2;

  const front = { x: scale, y: scale, width: 10 * scale, height: 16 * scale };

  if (front.x + front.width > cape.width || front.y + front.height > cape.height) return;

  return front;
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

    const pages = capes.flatMap(({ label, image }) => {
      const front = image && getCapeFront(image);
      if (!image || !front) return [];

      return [{ label, generator: () => this.renderCape(image, front) }];
    });

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

  private renderCape(cape: Image, front: CapeFront) {
    // The front is always 10 by 16, so it fills this canvas at every texture scale
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
