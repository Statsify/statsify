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
  it("ignores unsupported glyphs with a loaded unicode page", () => {
    const page = createCanvas(256, 256);
    const target = createCanvas(16, 16).getContext("2d");

    const renderer = new FontRenderer(false);
    renderer["images"] = new Map([["1f", { canvas: page, scale: 1 }]]);

    expect(() => renderer.fillText(target, renderer.lex("🌙"), 0, 0)).not.toThrow();
  });

  it("ignores zero-width glyph metadata", () => {
    const page = createCanvas(256, 256);
    const target = createCanvas(16, 16).getContext("2d");

    const renderer = new FontRenderer(false);
    renderer["images"] = new Map([["12", { canvas: page, scale: 1 }]]);

    expect(() => renderer.fillText(target, renderer.lex("\u1249"), 0, 0)).not.toThrow();
  });

  it("ignores glyphs with zero scaled dimensions", () => {
    const page = createCanvas(256, 256);
    const target = createCanvas(16, 16).getContext("2d");

    const renderer = new FontRenderer(false);
    renderer["images"] = new Map([["ascii", { canvas: page, scale: 0 }]]);

    expect(() => renderer.fillText(target, renderer.lex("A"), 0, 0)).not.toThrow();
  });
});
