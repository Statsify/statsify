/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Canvas, loadImage } from "skia-canvas";
import type { CanvasBackend } from "./core/canvas.js";

// skia-canvas has the same 2D API as OffscreenCanvas, but not its DOM types
const offscreen = (canvas: Canvas) => canvas as unknown as OffscreenCanvas;

// skia-canvas applies a PNG's gamma and color profile (75 of the 1.8.9 jar's textures have gAMA), but the game
// and the browser backend's colorSpaceConversion "none" draw the raw values
const COLOR_CHUNKS = new Set(["gAMA", "cHRM", "sRGB", "iCCP"]);

function withoutColorChunks(png: Buffer) {
  const kept = [png.subarray(0, 8)];
  for (let at = 8; at < png.length;) {
    const end = at + 12 + png.readUInt32BE(at);
    if (!COLOR_CHUNKS.has(png.toString("latin1", at + 4, at + 8))) kept.push(png.subarray(at, end));
    at = end;
  }

  return Buffer.concat(kept);
}

/** Draws with skia-canvas, for Node, where OffscreenCanvas and createImageBitmap don't exist */
export const skiaCanvas: CanvasBackend = {
  createCanvas: (width, height) => offscreen(new Canvas(width, height)),
  async decodePng(file) {
    const image = await loadImage(withoutColorChunks(Buffer.from(file.buffer, file.byteOffset, file.byteLength)));
    const canvas = new Canvas(image.width, image.height);
    canvas.getContext("2d").drawImage(image, 0, 0);
    return offscreen(canvas);
  },
};
