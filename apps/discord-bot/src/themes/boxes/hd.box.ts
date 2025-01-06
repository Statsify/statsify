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
  { winterTheme }
) => {
  ctx.filter = "brightness(90%)";
  const fill = Box.resolveFill(color, ctx, x, y, width, height);
  ctx.fillStyle = winterTheme.getIce(ctx);

  width = width + padding.left + padding.right;
  height = height + padding.top + padding.bottom;

  /**
   * Prevent Anti Aliasing
   */
  x = Math.round(x) - 1;
  y = Math.round(y) - 1;
  width = Math.round(width) + 2;
  height = Math.round(height) + 2;

  border = { ...border };

  border.bottomLeft /= 2;
  border.bottomRight /= 2;
  border.topLeft /= 2;
  border.topRight /= 2;

  ctx.beginPath();
  ctx.moveTo(x, y + border.topLeft + border.topLeft);
  ctx.lineTo(x + border.topLeft, y + border.topLeft + border.topLeft);
  ctx.lineTo(x + border.topLeft, y + border.topLeft);
  ctx.lineTo(x + border.topLeft + border.topLeft, y + border.topLeft);
  ctx.lineTo(x + border.topLeft + border.topLeft, y);
  ctx.lineTo(x + width - border.topRight - border.topRight, y);
  ctx.lineTo(x + width - border.topRight - border.topRight, y + border.topRight);
  ctx.lineTo(x + width - border.topRight, y + border.topRight);
  ctx.lineTo(x + width - border.topRight, y + border.topRight + border.topRight);
  ctx.lineTo(x + width, y + border.topRight + border.topRight);
  ctx.lineTo(x + width, y + height - border.bottomRight - border.bottomRight);
  ctx.lineTo(
    x + width - border.bottomRight,
    y + height - border.bottomRight - border.bottomRight
  );
  ctx.lineTo(x + width - border.bottomRight, y + height - border.bottomRight);
  ctx.lineTo(
    x + width - border.bottomRight - border.bottomRight,
    y + height - border.bottomRight
  );
  ctx.lineTo(x + width - border.bottomRight - border.bottomRight, y + height);
  ctx.lineTo(x + border.bottomLeft + border.bottomLeft, y + height);
  ctx.lineTo(x + border.bottomLeft + border.bottomLeft, y + height - border.bottomLeft);
  ctx.fill();

  ctx.filter = "none";

  if (fill !== Box.DEFAULT_COLOR) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  ctx.filter = "brightness(90%)";
  ctx.globalCompositeOperation = "overlay";

  Box.renderOverlay(ctx, x, y, height);

  ctx.globalCompositeOperation = "source-over";

  if (outline) {
    ctx.strokeStyle =
      outline === true ? Box.resolveFill(color, ctx, x, y, width, height) : outline;
    ctx.lineWidth = outlineSize;
    ctx.stroke();
  }

  if (!shadowDistance) return;
  shadowDistance /= 2;

  ctx.globalAlpha = shadowOpacity - 0.3;
  ctx.fillStyle = fill;

  ctx.fillRect(
    x + width,
    y + shadowDistance + border.topRight + border.topRight,
    shadowDistance,
    height -
    shadowDistance -
    border.bottomRight -
    border.bottomRight -
    border.topRight -
    border.topRight
  );

  ctx.fillRect(
    x + shadowDistance + border.bottomLeft + border.bottomLeft,
    y + height,
    width -
    shadowDistance -
    border.bottomRight -
    border.bottomRight -
    border.bottomLeft -
    border.bottomLeft,
    shadowDistance
  );

  if (border.bottomRight) {
    ctx.fillRect(
      x + width - border.bottomRight,
      y + height - border.bottomRight - border.bottomRight,
      shadowDistance,
      shadowDistance
    );

    ctx.fillRect(
      x + width - border.bottomRight - border.bottomRight,
      y + height - border.bottomRight,
      shadowDistance,
      shadowDistance
    );
  }

  if (!border.bottomRight && !border.topRight) {
    ctx.fillRect(x + width, y + height, shadowDistance, shadowDistance);
  }

  ctx.globalAlpha = 1;
  ctx.filter = "none";

  Box.renderSnow(ctx, winterTheme, x, y, width);
};
