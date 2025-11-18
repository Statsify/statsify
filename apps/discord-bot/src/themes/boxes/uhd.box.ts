/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box, Render } from "@statsify/rendering";

export const render: Render<Box.BoxRenderProps> = (
  ctx,
  {
    color = Box.DEFAULT_COLOR,
    border,
    shadowDistance,
    shadowOpacity = Box.SHADOW_OPACITY,
    outline,
    outlineSize,
  },
  { x, y, width, height, padding },
  { boxColorFill }
) => {
  const fill = Box.resolveFill(color === Box.DEFAULT_COLOR ? boxColorFill : color, ctx, x, y, width, height);
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

  border = { ...border };

  border.bottomLeft *= 2;
  border.bottomRight *= 2;
  border.topLeft *= 2;
  border.topRight *= 2;

  ctx.beginPath();
  ctx.moveTo(x + border.topLeft, y);
  ctx.lineTo(x + width - border.topRight, y);

  // Top Right Corner
  ctx.quadraticCurveTo(x + width, y, x + width, y + border.topRight);
  ctx.lineTo(x + width, y + height - border.bottomRight);

  // Bottom Right Corner
  ctx.quadraticCurveTo(x + width, y + height, x + width - border.bottomRight, y + height);
  ctx.lineTo(x + border.bottomLeft, y + height);

  // Bottom Left Corner
  ctx.quadraticCurveTo(x, y + height, x, y + height - border.bottomLeft);
  ctx.lineTo(x, y + border.topLeft);

  // Top Left Corner
  ctx.quadraticCurveTo(x, y, x + border.topLeft, y);
  ctx.closePath();
  ctx.fill();

  Box.renderOverlay(ctx, x, y, height);

  if (outline) {
    ctx.strokeStyle =
      outline === true ? Box.resolveFill(color, ctx, x, y, width, height) : outline;
    ctx.lineWidth = outlineSize;
    ctx.stroke();
  }

  if (!shadowDistance) return;

  ctx.globalAlpha = shadowOpacity;
  ctx.fillStyle = fill;

  ctx.beginPath();
  ctx.moveTo(x + width, y + shadowDistance);

  // Shadow Top Right Corner
  ctx.quadraticCurveTo(
    x + width,
    y + shadowDistance,
    x + width + shadowDistance,
    y + border.topRight + shadowDistance
  );

  ctx.lineTo(
    x + width + shadowDistance,
    y + height - border.bottomRight + shadowDistance
  );

  // Shadow Outer Bottom Right Corner
  ctx.quadraticCurveTo(
    x + width + shadowDistance,
    y + height + shadowDistance,
    x + width - border.bottomRight + shadowDistance,
    y + height + shadowDistance
  );

  ctx.lineTo(x + border.bottomLeft + shadowDistance, y + height + shadowDistance);

  // Shadow Bottom Left Corner
  ctx.quadraticCurveTo(x + shadowDistance, y + height, x + shadowDistance, y + height);

  ctx.lineTo(x + width - border.bottomRight, y + height);

  // Shadow Inner Bottom Right Corner
  ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - border.bottomRight);

  ctx.lineTo(x + width, y + shadowDistance);

  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;
};

