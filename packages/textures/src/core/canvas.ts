/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/** Where canvases come from: OffscreenCanvas in browsers, or another 2D canvas such as skia-canvas in Node */
export interface CanvasBackend {
  createCanvas(width: number, height: number): OffscreenCanvas;
  decodePng(file: Uint8Array): Promise<OffscreenCanvas>;
}

let backend: CanvasBackend = {
  createCanvas: (width, height) => new OffscreenCanvas(width, height),
  async decodePng(file) {
    const image = await createImageBitmap(new Blob([file as Uint8Array<ArrayBuffer>], { type: "image/png" }), {
      colorSpaceConversion: "none",
      premultiplyAlpha: "none",
    });
    const canvas = new OffscreenCanvas(image.width, image.height);
    canvas.getContext("2d")!.drawImage(image, 0, 0);
    image.close();
    return canvas;
  },
};

export function setCanvasBackend(next: CanvasBackend) {
  backend = next;
}

export const createCanvas = (width: number, height: number) => backend.createCanvas(width, height);

export const decodePng = (file: Uint8Array) => backend.decodePng(file);

// A PNG's size sits in its IHDR chunk, so it's known without decoding
export function pngSize(file: Uint8Array) {
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

export function context(canvas: OffscreenCanvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D isn't available");

  ctx.imageSmoothingEnabled = false;
  return ctx;
}

export const hex = (color: number) => `#${color.toString(16).padStart(6, "0")}`;

// From a context, since Node has no global ImageData
export const createImageData = (width: number, height: number) => context(createCanvas(1, 1)).createImageData(width, height);
