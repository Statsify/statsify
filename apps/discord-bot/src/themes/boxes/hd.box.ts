/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Box, Render } from "@statsify/rendering";
import { CanvasRenderingContext2D } from "skia-canvas";

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
  { x, y, width, height, padding }
) => {
  const fill = Box.resolveFill(color, ctx, x, y, width, height);
  ctx.fillStyle = fill;

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
      outline === true ? Box.resolveFill(color, ctx, x, y, width, height) : outline;
    ctx.lineWidth = outlineSize;
    ctx.stroke();
  }

  boxPath(ctx, x, y, width, height, border, 2);
  ctx.strokeStyle = Box.BORDER;
  ctx.lineWidth = 4;
  ctx.stroke();

  boxPath(ctx, x, y, width, height, border, 1);
  ctx.strokeStyle = Box.BORDER_HIGHLIGHT;
  ctx.lineWidth = 2;
  ctx.stroke();

  drawPattern(ctx, "horizontal", x + (2 * border.topLeft), y, width - (2 * border.topRight) - (2 * border.topLeft));
  drawPattern(ctx, "horizontal", x + (2 * border.bottomLeft), y + height - 4, width - (2 * border.bottomRight) - (2 * border.bottomLeft));

  drawPattern(ctx, "vertical", x, y + (2 * border.topLeft), height - (2 * border.topLeft) - (2 * border.bottomLeft));
  drawPattern(ctx, "vertical", x + width - 4, y + (2 * border.topRight), height - (2 * border.topRight) - (2 * border.bottomRight));

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
};

function drawPattern(ctx: CanvasRenderingContext2D, direction: "horizontal" | "vertical", x: number, y: number, length: number) {
  if (direction === "horizontal") {
    const patternWidth = 60;

    for (let i = 0; i < length; i += patternWidth) {
      const width = Math.min(patternWidth, length - i);

      if (width < 30) continue;

      const center = (width - 30) / 2;
      horizontalSquiggle(ctx, x + i + center, y, Box.SQUIGGLE, Box.SQUIGGLE_HIGHLIGHT);
    }
  } else {
    const patternHeight = 60;

    for (let i = 0; i < length; i += patternHeight) {
      const height = Math.min(patternHeight, length - i);

      if (height < 30) continue;

      const center = (height - 30) / 2;
      verticalSquiggle(ctx, x, y + i + center, Box.SQUIGGLE, Box.SQUIGGLE_HIGHLIGHT);
    }
  }
}

function horizontalSquiggle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, highlight: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x + 3, y + 2, 12, 2);
  ctx.fillRect(x + 9, y, 12, 2);

  ctx.fillRect(x + 15, y + 2, 3, 1);

  ctx.fillStyle = highlight;
  ctx.fillRect(x + 3, y + 2, 1, 2);
  ctx.fillRect(x + 3, y + 2, 4, 1);
  ctx.fillRect(x + 9, y, 12, 1);

  ctx.fillRect(x + 6, y + 1, 4, 1);
  ctx.fillRect(x + 21, y, 3, 1);
  ctx.fillRect(x, y + 3, 3, 1);
}

function verticalSquiggle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, highlight: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 3, 2, 12);
  ctx.fillRect(x + 2, y + 9, 2, 12);
  ctx.fillRect(x + 2, y + 6, 1, 3);

  ctx.fillStyle = highlight;
  ctx.fillRect(x, y + 3, 1, 12);
  ctx.fillRect(x + 2, y + 17, 1, 4);
  ctx.fillRect(x + 2, y + 20, 2, 1);

  ctx.fillRect(x, y, 1, 3);
  ctx.fillRect(x + 1, y + 14, 1, 4);
  ctx.fillRect(x + 3, y + 21, 1, 3);
}

function boxPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, border: Box.BoxBorderRadius, offset: number) {
  x += offset;
  y += offset;
  width -= 2 * offset;
  height -= 2 * offset;

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
}
