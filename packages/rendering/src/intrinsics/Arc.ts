/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CanvasRenderingContext2D } from "skia-canvas";
import type * as JSX from "#jsx";

export interface ArcRenderProps {
  value: number;
  min: number;
  max: number;
  startAngle: number;
  endAngle: number;
  trackColor: JSX.Fill;
  fillColor: JSX.Fill;
  trackWidth: number;
  fillWidth: number;
  lineCap: CanvasLineCap;
  centerLabel?: string;
  centerLabelColor: JSX.Fill;
  centerLabelSize: number;
}

export interface ArcProps extends Partial<Omit<ArcRenderProps, "value" | "min" | "max">> {
  value: number;
  min?: number;
  max?: number;
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  align?: JSX.StyleLocation;
}

export const component: JSX.RawFC<ArcProps, ArcRenderProps, undefined> = ({
  value,
  min = 0,
  max = 100,
  startAngle = -Math.PI * 0.75,
  endAngle = Math.PI * 0.75,
  trackColor = "rgba(255, 255, 255, 0.12)",
  fillColor = "#9ca3af",
  trackWidth = 8,
  fillWidth = 8,
  lineCap = "round",
  centerLabel,
  centerLabelColor = "#ffffff",
  centerLabelSize = 14,
  width = 80,
  height = 80,
  margin = 4,
  location = "center",
  align = "center",
}) => ({
  dimension: { width, height, margin },
  style: { location, direction: "row", align },
  props: {
    value,
    min,
    max,
    startAngle,
    endAngle,
    trackColor,
    fillColor,
    trackWidth,
    fillWidth,
    lineCap,
    centerLabel,
    centerLabelColor,
    centerLabelSize,
  },
  children: undefined,
});

export const render: JSX.Render<ArcRenderProps> = (
  ctx: CanvasRenderingContext2D,
  {
    value,
    min,
    max,
    startAngle,
    endAngle,
    trackColor,
    fillColor,
    trackWidth,
    fillWidth,
    lineCap,
    centerLabel,
    centerLabelColor,
    centerLabelSize,
  },
  { x, y, width, height }
) => {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const radius = Math.max(1, Math.min(width, height) / 2 - Math.max(trackWidth, fillWidth) / 2 - 2);

  const sweep = endAngle - startAngle;
  const clamped = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));

  ctx.save();
  ctx.lineCap = lineCap;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.strokeStyle = trackColor;
  ctx.lineWidth = trackWidth;
  ctx.stroke();

  if (clamped > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + sweep * clamped);
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = fillWidth;
    ctx.stroke();
  }

  if (centerLabel) {
    ctx.fillStyle = centerLabelColor;
    ctx.font = `bold ${centerLabelSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(centerLabel, cx, cy);
  }

  ctx.restore();
};
