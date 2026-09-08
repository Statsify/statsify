/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CanvasRenderingContext2D } from "skia-canvas";
import type * as JSX from "#jsx";
import type { GradientColor } from "#hooks";

export type GradientType = "linear-h" | "linear-v" | "radial";

export interface GradientRenderProps {
  type: GradientType;
  colors: GradientColor[];
  opacity: number;
}

export interface GradientProps extends Partial<GradientRenderProps> {
  colors: GradientColor[];
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  align?: JSX.StyleLocation;
}

export const component: JSX.RawFC<GradientProps, GradientRenderProps, undefined> = ({
  colors,
  type = "linear-v",
  opacity = 1,
  width = "100%",
  height = "100%",
  margin = 0,
  location = "left",
  align = "left",
}) => ({
  dimension: { width, height, margin },
  style: { location, direction: "row", align },
  props: { type, colors, opacity },
  children: undefined,
});

export const render: JSX.Render<GradientRenderProps> = (
  ctx: CanvasRenderingContext2D,
  { type, colors, opacity },
  { x, y, width, height }
) => {
  if (!colors.length) return;

  ctx.save();
  ctx.globalAlpha = opacity;

  let gradient;
  if (type === "radial") {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const r = Math.min(width, height) / 2;
    gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  } else if (type === "linear-h") {
    gradient = ctx.createLinearGradient(x, y, x + width, y);
  } else {
    gradient = ctx.createLinearGradient(x, y, x, y + height);
  }

  for (const [offset, color] of colors) gradient.addColorStop(offset, color);

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
};
