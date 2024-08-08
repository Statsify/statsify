/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { CanvasGradient, CanvasRenderingContext2D } from "skia-canvas";

export type DeferredGradient = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => CanvasGradient;

export type GradientDirection = "horizontal" | "vertical";
/**
 * @example ```ts
 *  [0.5, "rgba(0, 0, 0, 0.5)"]
 * ```
 */
export type GradientColor = [offset: number, color: string];

export function useGradient(
  type: GradientDirection,
  ...colors: GradientColor[]
): DeferredGradient {
  return (ctx, x, y, width, height) => {
    const gradient
      = type === "horizontal"
        ? ctx.createLinearGradient(x, y, x + width, y)
        : ctx.createLinearGradient(x, y, x, y + height);

    colors.forEach(([offset, color]) => gradient.addColorStop(offset, color));

    return gradient;
  };
}
