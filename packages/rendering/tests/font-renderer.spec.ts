/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FontRenderer } from "../src/font/font-renderer.js";
import { createCanvas } from "../src/canvas.js";
import { expect, it, suite } from "vitest";

suite("FontRenderer", () => {
  it("reads glyph image data from the stored backing canvas", () => {
    const page = createCanvas(256, 256);
    const pageCtx = {
      getImageData() {
        throw new Error("stale context");
      },
    } as unknown as ReturnType<ReturnType<typeof createCanvas>["getContext"]>;
    const target = createCanvas(16, 16).getContext("2d");

    const renderer = new FontRenderer(false);
    renderer["images"] = new Map([["ascii", pageCtx]]);
    renderer["canvases"].set(pageCtx, page);
    renderer["scales"].set(pageCtx, 1);

    expect(() => renderer.fillText(target, renderer.lex("A"), 0, 0)).not.toThrow();
  });

  it("uses the stored scale when the context does not expose a canvas", () => {
    const pageCtx = createCanvas(256, 256).getContext("2d");

    Object.defineProperty(pageCtx, "canvas", { value: undefined });

    const renderer = new FontRenderer(false);
    renderer["images"] = new Map([["ascii", pageCtx]]);
    renderer["scales"].set(pageCtx, 1);

    expect(() => renderer.measureText(renderer.lex("A"))).not.toThrow();
  });

  it("ignores unsupported glyphs with a loaded unicode page", () => {
    const pageCtx = createCanvas(256, 256).getContext("2d");
    const target = createCanvas(16, 16).getContext("2d");

    const renderer = new FontRenderer(false);
    renderer["images"] = new Map([["1f", pageCtx]]);
    renderer["canvases"].set(pageCtx, pageCtx.canvas);
    renderer["scales"].set(pageCtx, 1);

    expect(() => renderer.fillText(target, renderer.lex("🌙"), 0, 0)).not.toThrow();
  });

  it("ignores zero-width glyph metadata", () => {
    const pageCtx = createCanvas(256, 256).getContext("2d");
    const target = createCanvas(16, 16).getContext("2d");

    const renderer = new FontRenderer(false);
    renderer["images"] = new Map([["12", pageCtx]]);
    renderer["canvases"].set(pageCtx, pageCtx.canvas);
    renderer["scales"].set(pageCtx, 1);

    expect(() => renderer.fillText(target, renderer.lex("\u1249"), 0, 0)).not.toThrow();
  });
});
