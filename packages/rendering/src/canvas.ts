/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Canvas, type ExportOptions } from "skia-canvas";

type CanvasOptions = ConstructorParameters<typeof Canvas>[2] & { gpu?: boolean };

export function createCanvas(
  width?: number,
  height?: number,
  options: CanvasOptions = {}
): Canvas {
  return new Canvas(width, height, { gpu: false, ...options });
}

/**
 * Export settings for every PNG Statsify sends. Without adaptive row
 * filtering, cards come out larger but encode about three times faster, and
 * the extra bytes only cross the server's link to Discord.
 */
const PNG_EXPORT: ExportOptions = { filters: "none" };

/** Encodes a canvas as a PNG with Statsify's export settings */
export function toPng(canvas: Canvas): Promise<Buffer> {
  return canvas.toBuffer("png", PNG_EXPORT);
}
