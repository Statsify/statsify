/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Canvas, type Image } from "skia-canvas";

type CanvasOptions = ConstructorParameters<typeof Canvas>[2] & { gpu?: boolean };

export function createCanvas(
  width?: number,
  height?: number,
  options: CanvasOptions = {}
): Canvas {
  return new Canvas(width, height, { gpu: false, ...options });
}

/** The front of a player's head as a PNG: the face from a skin texture with the hat layer on top */
export function renderHead(skin: Image, size: number) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);

  ctx.drawImage(skin, 8, 8, 8, 8, 0, 0, size, size);
  ctx.drawImage(skin, 40, 8, 8, 8, 0, 0, size, size);

  return canvas.toBuffer("png");
}
