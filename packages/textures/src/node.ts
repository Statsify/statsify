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

/** Draws with skia-canvas, for Node, where OffscreenCanvas and createImageBitmap don't exist */
export const skiaCanvas: CanvasBackend = {
  createCanvas: (width, height) => offscreen(new Canvas(width, height)),
  async decodePng(file) {
    const image = await loadImage(Buffer.from(file.buffer, file.byteOffset, file.byteLength));
    const canvas = new Canvas(image.width, image.height);
    canvas.getContext("2d").drawImage(image, 0, 0);
    return offscreen(canvas);
  },
};
