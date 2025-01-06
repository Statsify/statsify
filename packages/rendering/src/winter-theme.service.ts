/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Service } from "typedi";
import { getAssetPath } from "@statsify/assets";
import { loadImage } from "./index.js";
import type { CanvasPattern, CanvasRenderingContext2D, Image } from "skia-canvas";

const WINTER_ASSETS = ["box-snow-center", "box-snow-left", "box-snow-right", "ice", "blue_ice", "frosted_ice_0", "packed_ice"];
type WinterAsset = typeof WINTER_ASSETS[number];

@Service()
export class WinterThemeService {
  private assets: Map<string, Image> = new Map();

  private ice?: CanvasPattern;
  private blueIce?: CanvasPattern;
  private frostedIce?: CanvasPattern;
  private packedIce?: CanvasPattern;

  public async init() {
    await Promise.all(
      WINTER_ASSETS.map((image) =>
        loadImage(getAssetPath(`winter/${image}.png`)).then((asset) => this.assets.set(image, asset))
      )
    );
  }

  public getAsset(asset: WinterAsset): Image {
    return this.assets.get(asset)!;
  }

  public getIce(ctx: CanvasRenderingContext2D): CanvasPattern {
    if (!this.ice) this.createIcePatterns(ctx);
    const index = Math.floor(Math.random() * 4);

    switch (index) {
      case 0:
        return this.ice!;
      case 1:
        return this.blueIce!;
      case 2:
        return this.frostedIce!;
      case 3:
        return this.packedIce!;
      default:
        return this.ice!;
    }
  }

  private createIcePatterns(ctx: CanvasRenderingContext2D) {
    this.ice = ctx.createPattern(this.getAsset("ice"), "repeat")!;
    this.blueIce = ctx.createPattern(this.getAsset("blue_ice"), "repeat")!;
    this.frostedIce = ctx.createPattern(this.getAsset("frosted_ice_0"), "repeat")!;
    this.packedIce = ctx.createPattern(this.getAsset("packed_ice"), "repeat")!;
  }
}
