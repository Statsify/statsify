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

export interface BoxProps extends Omit<Partial<BoxRenderProps>, "color" | "outline"> {
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
  height: number
) => {
  if (typeof fill === "string" || typeof fill === "object") return fill;
  return fill(ctx, x, y, width, height);
};

export const DEFAULT_COLOR = "rgba(0, 10, 5, 0.5)";
export const SHADOW_OPACITY = 0.84;

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
}) => {
  const completePadding = toCompleteSpacing(padding);
  completePadding.top += 4;
  completePadding.bottom += 4;
  completePadding.left += 4;
  completePadding.right += 4;

  return ({
    dimension: {
      padding: completePadding,
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
};

export const BORDER = "#014600";
export const BORDER_HIGHLIGHT = "#086306";
export const SQUIGGLE = "#9B0E0E";
export const SQUIGGLE_HIGHLIGHT = "#B92121";

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
  { x, y, width, height, padding }
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

  boxPath(ctx, x, y, width, height, border, 0);
  ctx.fill();

  ctx.globalCompositeOperation = "overlay";

  const overlay = ctx.createLinearGradient(x, y, x, y + height);
  overlay.addColorStop(0, "rgba(255, 255, 255, 0.15)");
  overlay.addColorStop(1, "rgba(0, 0, 0, 0.15)");
  ctx.fillStyle = overlay;
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";

  if (outline) {
    ctx.strokeStyle =
      outline === true ? resolveFill(color, ctx, x, y, width, height) : outline;
    ctx.lineWidth = outlineSize;
    ctx.stroke();
  }

  boxPath(ctx, x, y, width, height, border, 2);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 4;
  ctx.stroke();

  boxPath(ctx, x, y, width, height, border, 1);
  ctx.strokeStyle = BORDER_HIGHLIGHT;
  ctx.lineWidth = 2;
  ctx.stroke();

  drawPattern(ctx, "horizontal", x + border.topLeft, y, width - border.topRight - border.topLeft);
  drawPattern(ctx, "horizontal", x + border.bottomLeft, y + height - 4, width - border.bottomRight - border.bottomLeft);

  drawPattern(ctx, "vertical", x, y + border.topLeft, height - border.topLeft - border.bottomLeft);
  drawPattern(ctx, "vertical", x + width - 4, y + border.topRight, height - border.topRight - border.bottomRight);

  if (!shadowDistance) return;

  ctx.globalAlpha = shadowOpacity;
  ctx.fillStyle = fill;

  ctx.beginPath();
  ctx.moveTo(x + width, y + shadowDistance + border.topRight);
  ctx.lineTo(x + width + shadowDistance, y + shadowDistance + border.topRight);
  ctx.lineTo(
    x + width + shadowDistance,
    y + height - border.bottomRight + shadowDistance
  );
  ctx.lineTo(x + width, y + height - border.bottomRight + shadowDistance);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + border.bottomLeft + shadowDistance, y + height);
  ctx.lineTo(x + border.bottomLeft + shadowDistance, y + height + shadowDistance);
  ctx.lineTo(
    x + width + shadowDistance - (border.bottomRight || shadowDistance),
    y + height + shadowDistance
  );
  ctx.lineTo(
    x + width + shadowDistance - (border.bottomRight || shadowDistance),
    y + height
  );
  ctx.closePath();
  ctx.fill();

  if (border.bottomRight !== 0)
    ctx.fillRect(
      x + width - border.bottomRight,
      y + height - border.bottomRight,
      border.bottomRight,
      border.bottomRight
    );

  ctx.globalAlpha = 1;
};

function drawPattern(ctx: CanvasRenderingContext2D, direction: "horizontal" | "vertical", x: number, y: number, length: number) {
  if (direction === "horizontal") {
    const patternWidth = 48;

    for (let i = 0; i < length; i += patternWidth) {
      const width = Math.min(patternWidth, length - i);

      if (width < 18) continue;

      const center = (width - 18) / 2;
      horizontalSquiggle(ctx, x + i + center, y, SQUIGGLE, SQUIGGLE_HIGHLIGHT);
    }
  } else {
    const patternHeight = 48;

    for (let i = 0; i < length; i += patternHeight) {
      const height = Math.min(patternHeight, length - i);

      if (height < 18) continue;

      const center = (height - 18) / 2;
      verticalSquiggle(ctx, x, y + i + center, SQUIGGLE, SQUIGGLE_HIGHLIGHT);
    }
  }
}

function horizontalSquiggle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, highlight: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 2, 12, 2);
  ctx.fillRect(x + 6, y, 12, 2);

  ctx.fillStyle = highlight;
  ctx.fillRect(x, y + 2, 1, 2);
  ctx.fillRect(x, y + 2, 6, 1);
  ctx.fillRect(x + 6, y, 1, 3);
  ctx.fillRect(x + 6, y, 12, 1);
}

function verticalSquiggle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, highlight: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + 6, 2, 12);
  ctx.fillRect(x, y, 2, 12);

  ctx.fillStyle = highlight;
  ctx.fillRect(x, y, 1, 12);
  ctx.fillRect(x, y + 11, 3, 1);
  ctx.fillRect(x + 2, y + 12, 1, 6);
  ctx.fillRect(x + 2, y + 17, 2, 1);
}

function boxPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  border: BoxBorderRadius,
  offset: number
) {
  x += offset;
  y += offset;
  width -= 2 * offset;
  height -= 2 * offset;

  ctx.beginPath();
  ctx.moveTo(x + border.topLeft, y);
  ctx.lineTo(x + width - border.topRight, y);
  ctx.lineTo(x + width - border.topRight, y + border.topRight);
  ctx.lineTo(x + width, y + border.topRight);
  ctx.lineTo(x + width, y + height - border.bottomRight);
  ctx.lineTo(x + width - border.bottomRight, y + height - border.bottomRight);
  ctx.lineTo(x + width - border.bottomRight, y + height);
  ctx.lineTo(x + border.bottomLeft, y + height);
  ctx.lineTo(x + border.bottomLeft, y + height - border.bottomLeft);
  ctx.lineTo(x, y + height - border.bottomLeft);
  ctx.lineTo(x, y + border.topLeft);
  ctx.lineTo(x + border.topLeft, y + border.topLeft);
  ctx.closePath();
}

function toCompleteSpacing(spacing: JSX.Spacing): JSX.CompleteSpacing {
  if (typeof spacing === "number") return { top: spacing, right: spacing, bottom: spacing, left: spacing };

  return {
    top: spacing.top ?? 0,
    right: spacing.right ?? 0,
    bottom: spacing.bottom ?? 0,
    left: spacing.left ?? 0,
  };
}
