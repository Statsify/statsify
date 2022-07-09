/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Fill } from "../jsx";
import type * as JSX from "../jsx";

export interface BoxBorderRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

export interface BoxRenderProps {
  border: BoxBorderRadius;
  shadowDistance: number;
  shadowOpacity: number;
  color: Fill;
  outline?: Fill;
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
  color?: Fill;
  outline?: Fill | boolean;
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
  color = "rgba(0, 0, 0, 0.5)",
  shadowDistance = 4,
  shadowOpacity = 0.84,
  outlineSize = 4,
  outline,
}) => {
  const outlineColor = outline === true ? color : outline || undefined;

  return {
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
      outline: outlineColor,
    },
    children,
  };
};

export const render: JSX.Render<BoxRenderProps> = (
  ctx,
  { color, border, shadowDistance, shadowOpacity, outline, outlineSize },
  { x, y, width, height, padding }
) => {
  ctx.fillStyle = color;

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

  ctx.globalCompositeOperation = "overlay";

  const overlay = ctx.createLinearGradient(x, y, x, y + height);
  overlay.addColorStop(0, `rgba(255, 255, 255, 0.15)`);
  overlay.addColorStop(1, `rgba(0, 0, 0, 0.15)`);
  ctx.fillStyle = overlay;

  ctx.fill();

  ctx.globalCompositeOperation = "source-over";

  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = outlineSize;
    ctx.stroke();
  }

  if (!shadowDistance) return;

  //TODO(jacobk999): Fix box shadows
  ctx.globalAlpha = shadowOpacity;
  ctx.fillStyle = color;

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
