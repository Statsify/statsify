/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box, FontRenderer, type Render, type Theme, createCanvas } from "@statsify/rendering";
import { Container } from "typedi";
import type { Canvas } from "skia-canvas";

// ─── Tune these for the visual feel ──────────────────────────────────────────

/** Half-width of the shine band, as a fraction of each box's diagonal. */
const BAND_HALF = 0.12;

/**
 * Gradient extends this far past each box edge (in diagonal fractions) so the
 * band enters and exits fully off-canvas — making t=0 and t=1 both opacity-0
 * for a seamless loop.  Must be > BAND_HALF.
 */
const EXTEND = BAND_HALF * 2;

const TOTAL_EXT = 1 + 2 * EXTEND;

/** Peak alpha of the white highlight at the centre of the band. */
const PEAK_OPACITY = 0.18;

/** How much boxes phase-offset each other, as a fraction of the loop. */
const WAVE_SPREAD = 0.25;

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoxBorderRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

export interface BoxGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  border: BoxBorderRadius;
}

// Derive prop type from Box.render's signature — avoids importing the interface directly.
type BoxRenderProps = Parameters<typeof Box.render>[1];

// ─── Geometry collector ───────────────────────────────────────────────────────

/**
 * Returns a Theme whose `box` element interceptor draws boxes normally AND
 * appends each box's final painted geometry to `boxes`.  Works for any base
 * theme (including premium per-user box overrides).
 */
export function buildShineTheme(
  baseTheme: Theme | undefined,
  boxes: BoxGeometry[]
): Theme {
  const baseBoxRender: Render<BoxRenderProps> = baseTheme?.elements?.box ?? Box.render;

  const interceptBox: Render<BoxRenderProps> = (ctx, props, location, context, component) => {
    baseBoxRender(ctx, props, location, context, component);

    // Mirror Box.render's own rounding so geometry matches the pixel-perfect draw.
    const x = Math.round(location.x);
    const y = Math.round(location.y);
    const width = Math.round(location.width + location.padding.left + location.padding.right);
    const height = Math.round(location.height + location.padding.top + location.padding.bottom);
    boxes.push({ x, y, width, height, border: props.border });
  };

  return {
    context: baseTheme?.context ?? { renderer: Container.get(FontRenderer) },
    elements: { ...baseTheme?.elements, box: interceptBox },
  };
}

// ─── Frame renderer ───────────────────────────────────────────────────────────

export interface ShineOptions {
  /** Number of animation frames. Default: 30 (→ 3 s at 100 ms/frame). */
  frames?: number;
}

/**
 * Produces `frames` Canvas frames where the base card is composited with a
 * diagonal specular-shine band that sweeps across every box in sequence.
 *
 * Only the highlight layer changes between frames; base card pixels are static.
 */
export function buildShineFrames(
  baseCanvas: Canvas,
  boxes: BoxGeometry[],
  canvasWidth: number,
  canvasHeight: number,
  { frames = 30 }: ShineOptions = {}
): Canvas[] {
  // Normaliser for the wave-offset — sum of canvas extents gives a good proxy
  // for the card diagonal without the sqrt.
  const canvasMeasure = canvasWidth + canvasHeight;

  return Array.from({ length: frames }, (_, frameIndex) => {
    // Global phase: 0..1 exclusive (frame N loops back to frame 0 seamlessly).
    const t = frameIndex / frames;

    const frame = createCanvas(canvasWidth, canvasHeight);
    const ctx = frame.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    // Layer 1 — identical base card.
    ctx.drawImage(baseCanvas, 0, 0);

    // Layer 2 — per-box diagonal highlight, clipped to each box's rounded-rect.
    for (const box of boxes) {
      // Skip degenerate boxes (zero area — dividers, hairlines, etc.).
      if (box.width <= 0 || box.height <= 0) continue;

      // Per-box phase offset creates a wave across the card from top-left to bottom-right.
      const offset = ((box.x + box.y) / canvasMeasure) * WAVE_SPREAD;
      const boxT = (t + offset) % 1;

      // ── Build the extended diagonal gradient ──────────────────────────────
      // The gradient starts/ends EXTEND * (w,h) past each corner so the band
      // is invisible at t=0 and t=1 (seamless loop proof: band centre is
      // entirely outside the box at both endpoints).
      const dx = box.width * EXTEND;
      const dy = box.height * EXTEND;
      const gx0 = box.x - dx;
      const gy0 = box.y - dy;
      const gx1 = box.x + box.width + dx;
      const gy1 = box.y + box.height + dy;

      const grad = ctx.createLinearGradient(gx0, gy0, gx1, gy1);

      // Band centre in "band space" (−EXTEND → 1+EXTEND over the loop).
      const bandCenter = boxT * TOTAL_EXT - EXTEND;

      // Map to gradient coords [0, 1].
      const peakPos = (bandCenter + EXTEND) / TOTAL_EXT;
      const loPos = Math.max(0, (bandCenter - BAND_HALF + EXTEND) / TOTAL_EXT);
      const hiPos = Math.min(1, (bandCenter + BAND_HALF + EXTEND) / TOTAL_EXT);

      const clampedPeak = Math.max(0.001, Math.min(0.999, peakPos));

      grad.addColorStop(0, "rgba(255,255,255,0)");
      if (loPos > 0.001) grad.addColorStop(loPos, "rgba(255,255,255,0)");
      grad.addColorStop(clampedPeak, `rgba(255,255,255,${PEAK_OPACITY})`);
      if (hiPos < 0.999) grad.addColorStop(hiPos, "rgba(255,255,255,0)");
      grad.addColorStop(1, "rgba(255,255,255,0)");

      // ── Draw, clipped to the box's rounded-rect path ──────────────────────
      ctx.save();
      Box.buildBoxPath(ctx, box.x, box.y, box.width, box.height, box.border);
      ctx.clip();

      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = grad;
      ctx.fillRect(box.x, box.y, box.width, box.height);
      ctx.globalCompositeOperation = "source-over";

      ctx.restore();
    }

    return frame;
  });
}
