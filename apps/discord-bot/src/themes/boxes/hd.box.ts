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
    border: baseBorder,
    shadowDistance: fullShadowDistance,
    shadowOpacity = Box.SHADOW_OPACITY,
    outline,
    outlineSize,
  },
  { x: startX, y: startY, width: contentWidth, height: contentHeight, padding }
) => {
  const fill = Box.resolveFill(color, ctx, startX, startY, contentWidth, contentHeight);
  ctx.fillStyle = fill;

  /**
   * Prevent Anti Aliasing
   */
  const x = Math.round(startX) - 1;
  const y = Math.round(startY) - 1;
  const width = Math.round(contentWidth + padding.left + padding.right) + 2;
  const height = Math.round(contentHeight + padding.top + padding.bottom) + 2;

  const border = { ...baseBorder };

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
  ctx.lineTo(x + border.bottomLeft, y + height - border.bottomLeft - border.bottomLeft);
  ctx.lineTo(x, y + height - border.bottomLeft - border.bottomLeft);
  ctx.fill();

  Box.renderOverlay(ctx, x, y, height);

  if (outline) {
    ctx.strokeStyle =
      outline === true ? Box.resolveFill(color, ctx, x, y, width, height) : outline;
    ctx.lineWidth = outlineSize;
    ctx.stroke();
  }

  const shadowAlpha = shadowOpacity - 0.3;
  if (!fullShadowDistance || shadowAlpha <= 0) return;
  const shadowDistance = fullShadowDistance / 2;

  ctx.globalAlpha = shadowAlpha;
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
};
