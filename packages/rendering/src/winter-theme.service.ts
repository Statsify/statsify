/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Service } from "typedi";
import { getImage } from "@statsify/assets";
import type { CanvasPattern, CanvasRenderingContext2D, Image } from "skia-canvas";

const WINTER_ASSETS = ["box-snow-center", "box-snow-left", "box-snow-right", "ice"];
type WinterAsset = typeof WINTER_ASSETS[number];

@Service()
export class WinterThemeService {
  private assets: Map<string, Image> = new Map();
  private ice?: CanvasPattern;

  public async init() {
    await Promise.all(
      WINTER_ASSETS.map((image) =>
        getImage(`winter/${image}.png`).then((asset) => this.assets.set(image, asset))
      )
    );
  }

  public getAsset(asset: WinterAsset): Image {
    return this.assets.get(asset)!;
  }

  public getIce(ctx: CanvasRenderingContext2D): CanvasPattern {
    if (this.ice) return this.ice;
    this.ice = ctx.createPattern(this.getAsset("ice"), "repeat")!;
    return this.ice;
  }
}
