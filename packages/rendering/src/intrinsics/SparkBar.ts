/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CanvasRenderingContext2D } from "skia-canvas";
import type * as JSX from "#jsx";

export interface SparkBarRenderProps {
  data: number[];
  min?: number;
  max?: number;
  color: JSX.Fill;
  highlightColor: JSX.Fill;
  gap: number;
  radius: number;
  highlightLast: boolean;
  padding: number;
}

export interface SparkBarProps extends Partial<Omit<SparkBarRenderProps, "data">> {
  data: number[];
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  align?: JSX.StyleLocation;
}

export const component: JSX.RawFC<SparkBarProps, SparkBarRenderProps, undefined> = ({
  data,
  min,
  max,
  color = "#9ca3af",
  highlightColor = "#4ade80",
  gap = 2,
  radius = 2,
  highlightLast = false,
  padding = 4,
  width,
  height = 40,
  margin = 4,
  location = "center",
  align = "left",
}) => ({
  dimension: { width: width ?? data.length * 8 + (data.length - 1) * gap, height, margin },
  style: { location, direction: "row", align },
  props: { data, min, max, color, highlightColor, gap, radius, highlightLast, padding },
  children: undefined,
});

const resolveNumber = (v = 0) => (Number.isFinite(v) ? v : 0);

export const render: JSX.Render<SparkBarRenderProps> = (
  ctx: CanvasRenderingContext2D,
  { data, min, max, color, highlightColor, gap, radius, highlightLast, padding },
  { x, y, width, height }
) => {
  const values = data.map(resolveNumber);
  if (!values.length) return;

  const computedMin = min ?? 0;
  const computedMax = max ?? Math.max(1, ...values);
  const range = computedMax - computedMin || 1;

  const innerH = Math.max(1, height - padding * 2);
  const barW = Math.max(1, (width - (values.length - 1) * gap) / values.length);
  const lastIndex = values.length - 1;

  ctx.save();

  values.forEach((value, index) => {
    const fraction = Math.max(0, Math.min(1, (value - computedMin) / range));
    const barH = Math.max(radius * 2, innerH * fraction);
    const bx = x + index * (barW + gap);
    const by = y + padding + innerH - barH;

    ctx.fillStyle = highlightLast && index === lastIndex ? highlightColor : color;

    const r = Math.min(radius, barW / 2, barH / 2);
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + barW - r, by);
    ctx.arcTo(bx + barW, by, bx + barW, by + r, r);
    ctx.lineTo(bx + barW, by + barH - r);
    ctx.arcTo(bx + barW, by + barH, bx + barW - r, by + barH, r);
    ctx.lineTo(bx + r, by + barH);
    ctx.arcTo(bx, by + barH, bx, by + barH - r, r);
    ctx.lineTo(bx, by + r);
    ctx.arcTo(bx, by, bx + r, by, r);
    ctx.closePath();
    ctx.fill();
  });

  ctx.restore();
};
