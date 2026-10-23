/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CanvasRenderingContext2D } from "skia-canvas";
import type * as JSX from "#jsx";

export interface RadarSeries {
  values: number[];
  color: JSX.Fill;
  fillColor?: JSX.Fill;
}

export interface RadarRenderProps {
  labels: string[];
  series: [RadarSeries] | [RadarSeries, RadarSeries];
  gridColor: JSX.Fill;
  gridLevels: number;
  lineWidth: number;
  labelColor: JSX.Fill;
  labelSize: number;
  padding: number;
}

export interface RadarProps extends Partial<Omit<RadarRenderProps, "labels" | "series">> {
  labels: string[];
  series: [RadarSeries] | [RadarSeries, RadarSeries];
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  align?: JSX.StyleLocation;
}

export const component: JSX.RawFC<RadarProps, RadarRenderProps, undefined> = ({
  labels,
  series,
  gridColor = "rgba(255, 255, 255, 0.15)",
  gridLevels = 4,
  lineWidth = 1.5,
  labelColor = "rgba(255, 255, 255, 0.7)",
  labelSize = 11,
  padding = 24,
  width = 160,
  height = 160,
  margin = 4,
  location = "center",
  align = "center",
}) => ({
  dimension: { width, height, margin },
  style: { location, direction: "row", align },
  props: { labels, series, gridColor, gridLevels, lineWidth, labelColor, labelSize, padding },
  children: undefined,
});

const angleFor = (i: number, n: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

export const render: JSX.Render<RadarRenderProps> = (
  ctx: CanvasRenderingContext2D,
  { labels, series, gridColor, gridLevels, lineWidth, labelColor, labelSize, padding },
  { x, y, width, height }
) => {
  const n = labels.length;
  if (n < 3) return;

  const cx = x + width / 2;
  const cy = y + height / 2;
  const radius = Math.max(1, Math.min(width, height) / 2 - padding);

  ctx.save();
  ctx.lineWidth = lineWidth;

  for (let level = 1; level <= gridLevels; level++) {
    const r = (radius * level) / gridLevels;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = angleFor(i, n);
      const px = cx + r * Math.cos(a);
      const py = cy + r * Math.sin(a);
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.strokeStyle = gridColor;
    ctx.stroke();
  }

  for (let i = 0; i < n; i++) {
    const a = angleFor(i, n);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
    ctx.strokeStyle = gridColor;
    ctx.stroke();
  }

  for (const s of series) {
    const pts = s.values.map((v, i) => {
      const a = angleFor(i, n);
      const r = radius * Math.max(0, Math.min(1, v));
      return { px: cx + r * Math.cos(a), py: cy + r * Math.sin(a) };
    });

    if (s.fillColor) {
      ctx.beginPath();
      pts.forEach(({ px, py }, i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
      ctx.closePath();
      ctx.fillStyle = s.fillColor;
      ctx.fill();
    }

    ctx.beginPath();
    pts.forEach(({ px, py }, i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
    ctx.closePath();
    ctx.strokeStyle = s.color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  ctx.fillStyle = labelColor;
  ctx.font = `${labelSize}px sans-serif`;
  ctx.textBaseline = "middle";

  for (let i = 0; i < n; i++) {
    const a = angleFor(i, n);
    const lx = cx + (radius + labelSize) * Math.cos(a);
    const ly = cy + (radius + labelSize) * Math.sin(a);
    ctx.textAlign = Math.cos(a) > 0.1 ? "left" : (Math.cos(a) < -0.1 ? "right" : "center");
    ctx.fillText(labels[i], lx, ly);
  }

  ctx.restore();
};
