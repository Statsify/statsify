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
  { color, border, shadowDistance, shadowOpacity, outline, outlineSize },
  { x, y, width, height, padding }
) => {
  Box.resolveFill(color, ctx, x, y, width, height);

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
  ctx.lineTo(x + border.bottomLeft, y + height - border.bottomLeft);
  ctx.lineTo(x + border.bottomLeft, y + height - border.bottomLeft - border.bottomLeft);
  ctx.lineTo(x, y + height - border.bottomLeft - border.bottomLeft);
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
  shadowDistance /= 2;

  ctx.globalAlpha = shadowOpacity - 0.3;
  Box.resolveFill(color, ctx, x, y, width, height);

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
