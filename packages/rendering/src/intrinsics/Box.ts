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
    padding,
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
  ctx.fill();

  renderOverlay(ctx, x, y, height);

  if (outline) {
    ctx.strokeStyle =
      outline === true ? resolveFill(color, ctx, x, y, width, height) : outline;
    ctx.lineWidth = outlineSize;
    ctx.stroke();
  }

  if (!shadowDistance) return;

  ctx.globalAlpha = shadowOpacity;
  ctx.fillStyle = fill;

  ctx.beginPath();
  ctx.moveTo(x + width, y + shadowDistance + border.topRight);
  ctx.lineTo(x + width + shadowDistance, y + shadowDistance + border.topRight);
  ctx.lineTo(
    x + width + shadowDistance,
    y + height - border.bottomRight + shadowDistance,
  );
  ctx.lineTo(x + width, y + height - border.bottomRight + shadowDistance);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + border.bottomLeft + shadowDistance, y + height);
  ctx.lineTo(
    x + border.bottomLeft + shadowDistance,
    y + height + shadowDistance,
  );
  ctx.lineTo(
    x + width + shadowDistance - (border.bottomRight || shadowDistance),
    y + height + shadowDistance,
  );
  ctx.lineTo(
    x + width + shadowDistance - (border.bottomRight || shadowDistance),
    y + height,
  );
  ctx.closePath();
  ctx.fill();

  if (border.bottomRight !== 0)
    ctx.fillRect(
      x + width - border.bottomRight,
      y + height - border.bottomRight,
      border.bottomRight,
      border.bottomRight,
    );

  ctx.globalAlpha = 1;
};
