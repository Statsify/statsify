/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type AnimatedRegion, FontRenderer, type TextNode, createCanvas } from "@statsify/rendering";
import { Container } from "typedi";
import type { Canvas } from "skia-canvas";

export { renderStatic } from "@statsify/rendering";

/** Cubic ease-out: fast start, decelerates to final value. */
export const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * Formats a non-negative integer with comma separators, matching the project's
 * default locale formatting (en-US style: 1,234,567).
 */
export const formatCount = (n: number): string =>
  Math.round(n).toLocaleString("en-US");

export interface CountUpOptions {
  /** Number of animation frames. Default: 16 (~1 s at 60 ms/frame). */
  frames?: number;
  /** Delay between frames in milliseconds. Default: 60. */
  delayMs?: number;
}

/**
 * Given a static card canvas and the animated regions collected by `renderStatic`,
 * produces an array of composited `Canvas` frames where:
 *   frame 0 → all animated values at ~0
 *   frame N → all animated values at their final `numericValue`
 *
 * Only the text overlay is re-drawn per frame — the static card is copied once.
 */
export function buildCountUpFrames(
  staticCanvas: Canvas,
  regions: AnimatedRegion[],
  { frames = 16, delayMs: _delayMs = 60 }: CountUpOptions = {}
): Canvas[] {
  const renderer = Container.get(FontRenderer);
  const { width, height } = staticCanvas;

  return Array.from({ length: frames }, (_, i) => {
    const t = easeOut(i / Math.max(frames - 1, 1));

    const frame = createCanvas(width, height);
    const ctx = frame.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    // Layer 1: blit the static card (background, images, non-animated text)
    ctx.drawImage(staticCanvas, 0, 0);

    // Layer 2: draw each animated text region with an interpolated value
    for (const region of regions) {
      const node = region.text[0];
      if (!node) continue;

      const interpolated = region.numericValue * t;

      // Detect decimal places from the final text so ratios (e.g., "2.46")
      // use toFixed(2) while integer stats (e.g., "1,234") use comma formatting.
      const finalStr = node.text;
      const dotIdx = finalStr.indexOf(".");
      const formatted =
        dotIdx === -1 ?
          formatCount(interpolated) :
          interpolated.toFixed(finalStr.length - dotIdx - 1);

      // Build the text node directly — NOT via lex() — because lex() prepends §f
      // (white) when the string has no § prefix, which would override the color.
      // The color is already resolved to a CSS hex string by the initial lex pass.
      const newNodes: TextNode[] = [{
        text: formatted,
        color: node.color,
        bold: node.bold,
        italic: node.italic,
        underline: node.underline,
        strikethrough: node.strikethrough,
        obfuscated: false,
        size: node.size,
      }];

      renderer.fillText(ctx, newNodes, region.x, region.y);
    }

    return frame;
  });
}
