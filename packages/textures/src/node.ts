/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Canvas, loadImage } from "skia-canvas";
import { basename, join, relative, sep } from "node:path";
import type { CanvasBackend } from "./core/canvas.js";
import { createHash } from "node:crypto";
import { packFromEntries } from "./core/pack.js";
import { readFile, readdir } from "node:fs/promises";

// skia-canvas has the same 2D API as OffscreenCanvas, but not its DOM types
const toOffscreenCanvas = (canvas: Canvas) =>
  canvas as unknown as OffscreenCanvas;

// The game draws a PNG's raw values, but skia-canvas applies its gamma
const COLOR_CHUNKS = new Set(["gAMA", "cHRM", "sRGB", "iCCP"]);

function withoutColorChunks(png: Buffer) {
  const kept = [png.subarray(0, 8)];
  for (let at = 8; at < png.length; ) {
    const end = at + 12 + png.readUInt32BE(at);
    if (!COLOR_CHUNKS.has(png.toString("latin1", at + 4, at + 8)))
      kept.push(png.subarray(at, end));
    at = end;
  }

  return Buffer.concat(kept);
}

export const skiaCanvas: CanvasBackend = {
  createCanvas: (width, height) => toOffscreenCanvas(new Canvas(width, height)),
  async decodePng(file) {
    const image = await loadImage(
      withoutColorChunks(
        Buffer.from(file.buffer, file.byteOffset, file.byteLength),
      ),
    );
    const canvas = new Canvas(image.width, image.height);
    canvas.getContext("2d").drawImage(image, 0, 0);
    return toOffscreenCanvas(canvas);
  },
};

export async function loadPackFolder(folder: string, name = basename(folder)) {
  const paths = (
    await readdir(folder, { recursive: true, withFileTypes: true })
  )
    .filter((entry) => entry.isFile())
    .map((entry) => relative(folder, join(entry.parentPath, entry.name)))
    .toSorted();

  const files = await Promise.all(
    paths.map((path) => readFile(join(folder, path))),
  );

  const hash = createHash("sha256");
  const entries: Record<string, Uint8Array> = {};

  for (const [i, path] of paths.entries()) {
    const entry = path.split(sep).join("/");
    hash.update(entry).update(files[i]);
    entries[entry] = files[i];
  }

  return packFromEntries(entries, name, hash.digest("hex"));
}
