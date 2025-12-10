/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CanvasRenderingContext2D } from "skia-canvas";
import type * as JSX from "#jsx";
import type { DeferredGradient } from "#hooks";

export interface BoxBorderRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

export interface BoxRenderProps {
  border: BoxBorderRadius;
  shadowDistance: number;
  shadowOpacity?: number;
  color?: JSX.Fill | DeferredGradient;
  outline?: JSX.Fill;
  outlineSize: number;
}

export interface BoxProps extends Omit<
  Partial<BoxRenderProps>,
  "color" | "outline"
> {
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  padding?: JSX.Spacing;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  direction?: JSX.StyleDirection;
  align?: JSX.StyleLocation;
  color?: JSX.Fill | DeferredGradient;
  outline?: JSX.Fill | boolean;
}

export const resolveFill = (
  fill: JSX.Fill | DeferredGradient,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  if (typeof fill === "string" || typeof fill === "object") return fill;
  return fill(ctx, x, y, width, height);
};

export const DEFAULT_COLOR = "rgba(0, 10, 5, 0.5)";
export const SHADOW_OPACITY = 0.84;

function addSpacing(spacing: JSX.Spacing, amount: number) {
  const overall =
    typeof spacing === "number"
      ? { left: spacing, right: spacing, top: spacing, bottom: spacing }
      : {
          left: spacing.left ?? 0,
          right: spacing.right ?? 0,
          top: spacing.top ?? 0,
          bottom: spacing.bottom ?? 0,
        };

  return {
    left: overall.left + amount,
    right: overall.right + amount,
    top: overall.top + amount,
    bottom: overall.bottom + amount,
  };
}

export const component: JSX.RawFC<BoxProps, BoxRenderProps> = ({
  children,
  width,
  height,
  margin = 4,
  padding = { left: 8, right: 8 },
  location = "center",
  direction = "row",
  align = "left",
  border = { topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4 },
  color,
  shadowDistance = 4,
  shadowOpacity,
  outlineSize = 4,
  outline,
}) => ({
  dimension: {
    padding: addSpacing(padding, 4),
    margin,
    width,
    height,
  },
  style: { location, direction, align },
  props: {
    border,
    color,
    shadowDistance,
    shadowOpacity,
    outlineSize,
    outline,
  },
  children,
});

export const renderOverlay = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
) => {
  ctx.globalCompositeOperation = "overlay";
  const overlay = ctx.createLinearGradient(x, y, x, y + height);
  overlay.addColorStop(0, "rgba(255, 255, 255, 0.30)");
  overlay.addColorStop(1, "rgba(0, 0, 0, 0.30)");
  ctx.fillStyle = overlay;
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
};

export type BoxColorId = "red" | "yellow";

type BoxColor = {
  background: string;
  outline: string;
  ribbonBackground: string;
  ribbonAccent: string;
  patternTop: string;
  patternBottom: string;
};

export const BoxColors: Record<BoxColorId, BoxColor> = {
  red: {
    background: "rgba(142, 0, 0, 0.40)",
    outline: "rgba(124, 0, 0, 1)",
    ribbonBackground: "rgba(0, 99, 7, 0.30)",
    ribbonAccent: "rgba(0, 142, 9, 1)",
    patternTop: "rgba(92, 19, 19, 0.39)",
    patternBottom: "rgba(70, 11, 11, 1)",
  },
  yellow: {
    background: "rgba(255, 157, 0, 0.40)",
    outline: "rgba(218, 151, 7, 1)",
    ribbonBackground: "rgba(130, 0, 0, 0.30)",
    ribbonAccent: "rgba(142, 0, 0, 1)",
    patternTop: "rgba(159, 104, 0, 0.39)",
    patternBottom: "rgba(120, 79, 3, 0.70)",
  },
};

// prettier-ignore
const CHECKERS = {
  width: 4,
  height: 8,
  scale: 2,
  data: [
    1, 1, 0, 0,
    1, 1, 0, 0,
    0, 0, 1, 1,
    0, 0, 1, 1,
    1, 1, 0, 0,
    1, 1, 0, 0,
    1, 1, 1, 1,
    1, 1, 1, 1
  ],
};

// prettier-ignore
const DOTS = {
  width: 6,
  height: 5,
  scale: 2,
  data: [
    1, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 0, 0,
    0, 0, 1, 1, 0, 0,
    0, 0, 1, 1, 0, 0,
  ],
};

// prettier-ignore
const HEARTS = {
  width: 22,
  height: 24,
  // height: 27,
  scale: 1,
  data: [
    0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
    1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,
    1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    // 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
};

// prettier-ignore
const STRIPES = {
  width: 6,
  height: 11,
  scale: 2,
  data: [
    0, 1, 1, 0, 0, 0,
    0, 1, 1, 1, 0, 0,
    0, 0, 1, 1, 1, 0,
    0, 0, 0, 1, 1, 1,
    1, 0, 0, 0, 1, 1,
    1, 1, 0, 0, 0, 1,
    1, 1, 1, 0, 0, 0,
    0, 1, 1, 1, 0, 0,
    0, 0, 1, 1, 1, 0,
    0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 1, 1,
  ],
};

const AllPatterns = [STRIPES, DOTS, HEARTS, CHECKERS];

export const render: JSX.Render<BoxRenderProps> = (
  ctx,
  {
    color = DEFAULT_COLOR,
    border,
    shadowDistance,
    shadowOpacity = SHADOW_OPACITY,
    outline,
    outlineSize,
  },
  { x, y, width, height, padding },
  { boxColorId },
) => {
  const fill = resolveFill(color, ctx, x, y, width, height);
  ctx.fillStyle = fill;

  width = width + padding.left + padding.right;
  height = height + padding.top + padding.bottom;

  /**
   * Prevent Anti Aliasing
   */
  x = Math.round(x);
  y = Math.round(y);
  width = Math.round(width);
  height = Math.round(height);

  const outlineThickness = 4;
  const ribbonThickness = 14;
  const ribbonAccentThickness = 4;
  const ribbonOverlayThickness = 4;
  const ribbonVerticalX = Math.floor((width - ribbonThickness) / 2);
  const ribbonHorizontalY = Math.floor((height - ribbonThickness) / 2);

  const boxColor = BoxColors[boxColorId];

  // Draw background
  ctx.fillStyle = boxColor.background;
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
  ctx.fillRect(x, y, width, height);

  const pattern = AllPatterns[Math.floor(Math.random() * AllPatterns.length)];

  ctx.fillStyle = boxColor.patternTop;
  drawPresentPatternCanvas(
    ctx,
    pattern,
    x + outlineThickness,
    y + outlineThickness,
    width - 2 * outlineThickness,
    pattern.height * pattern.scale,
    true,
  );

  ctx.fillStyle = boxColor.patternBottom;
  drawPresentPatternCanvas(
    ctx,
    pattern,
    x + outlineThickness,
    y + height - outlineThickness - pattern.height * pattern.scale,
    width - 2 * outlineThickness,
    pattern.height * pattern.scale,
    false,
  );

  ctx.fillStyle = boxColor.outline;
  strokeRect(ctx, x, y, width, height, outlineThickness);

  ctx.fillStyle = boxColor.ribbonBackground;
  ctx.fillRect(
    x + ribbonAccentThickness,
    y + ribbonHorizontalY,
    width - 2 * ribbonAccentThickness,
    ribbonThickness,
  );
  ctx.fillRect(
    x + ribbonVerticalX,
    y + ribbonAccentThickness,
    ribbonThickness,
    ribbonHorizontalY - ribbonAccentThickness,
  );
  ctx.fillRect(
    x + ribbonVerticalX,
    y + ribbonHorizontalY + ribbonThickness,
    ribbonThickness,
    height - ribbonHorizontalY - ribbonThickness - ribbonAccentThickness,
  );

  ctx.fillStyle = boxColor.ribbonAccent;
  ctx.fillRect(
    x,
    y + ribbonHorizontalY,
    ribbonAccentThickness,
    ribbonThickness,
  );
  ctx.fillRect(
    x + width - ribbonAccentThickness,
    y + ribbonHorizontalY,
    ribbonAccentThickness,
    ribbonThickness,
  );

  ctx.fillRect(x + ribbonVerticalX, y, ribbonThickness, ribbonAccentThickness);
  ctx.fillRect(
    x + ribbonVerticalX,
    y + height - ribbonAccentThickness,
    ribbonThickness,
    ribbonAccentThickness,
  );

  ctx.globalCompositeOperation = "soft-light";

  // Ribbon Overlay
  ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
  ctx.fillRect(
    x,
    y + ribbonHorizontalY,
    ribbonVerticalX,
    ribbonOverlayThickness,
  );
  ctx.fillRect(
    x + ribbonVerticalX,
    y,
    ribbonOverlayThickness,
    ribbonHorizontalY + ribbonOverlayThickness,
  );

  ctx.fillStyle = "rgba(87, 87, 87, 0.42)";
  ctx.fillRect(
    x + ribbonVerticalX + ribbonThickness,
    y + ribbonHorizontalY + ribbonThickness - ribbonOverlayThickness,
    width - (ribbonVerticalX + ribbonThickness),
    ribbonOverlayThickness,
  );

  ctx.fillRect(
    x + ribbonVerticalX + ribbonThickness - ribbonOverlayThickness,
    y + ribbonHorizontalY + ribbonThickness,
    ribbonOverlayThickness,
    height - (ribbonHorizontalY + ribbonThickness),
  );

  // Outline Overlay
  ctx.fillStyle = "rgba(255, 255, 255, 0.81)";
  const halfOutlineThickness = outlineThickness / 2;
  ctx.fillRect(x, y, width, halfOutlineThickness);
  ctx.fillRect(
    x,
    y + halfOutlineThickness,
    halfOutlineThickness,
    height - halfOutlineThickness,
  );

  ctx.fillStyle = "rgba(0, 0, 0, 0.63)";
  ctx.fillRect(
    x,
    y + height - halfOutlineThickness,
    width,
    halfOutlineThickness,
  );
  ctx.fillRect(
    x + width - halfOutlineThickness,
    y,
    halfOutlineThickness,
    height - halfOutlineThickness,
  );
  ctx.globalCompositeOperation = "source-over";
};

function strokeRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  thickness: number,
) {
  ctx.fillRect(x, y, width, thickness);
  ctx.fillRect(x, y + height - thickness, width, thickness);

  ctx.fillRect(x, y + thickness, thickness, height - 2 * thickness);
  ctx.fillRect(
    x + width - thickness,
    y + thickness,
    thickness,
    height - 2 * thickness,
  );
}

function drawPresentPatternCanvas(
  ctx: CanvasRenderingContext2D,
  pattern: {
    width: number;
    height: number;
    scale: number;
    data: number[];
  },
  x0: number,
  y0: number,
  width: number,
  height: number,
  flip: boolean,
) {
  for (let i = 0; i < width; i += pattern.width * pattern.scale) {
    for (let py = 0; py < pattern.height; py++) {
      for (let px = 0; px < pattern.width; px++) {
        const index = py * pattern.width + px;

        if (pattern.data[index] === 0) continue;

        const x = i + px * pattern.scale;
        const y = (flip ? pattern.height - 1 - py : py) * pattern.scale;

        if (x >= width || y >= height) continue;

        const remainingWidth = Math.min(width - x, pattern.scale);
        const remainingHeight = Math.min(height - y, pattern.scale);

        ctx.fillRect(x0 + x, y0 + y, remainingWidth, remainingHeight);
      }
    }
  }
}
