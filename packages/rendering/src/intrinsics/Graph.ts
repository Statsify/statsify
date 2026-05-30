/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CanvasRenderingContext2D } from "skia-canvas";
import type * as JSX from "#jsx";

export interface GraphRenderProps {
  data: number[];
  min?: number;
  max?: number;
  color: JSX.Fill;
  fillColor?: JSX.Fill;
  referenceColor?: JSX.Fill;
  referenceValue?: number;
  lineWidth: number;
  pointRadius: number;
  smooth: boolean;
  padding: number;
}

export interface GraphProps extends Partial<Omit<GraphRenderProps, "data">> {
  data: number[];
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  align?: JSX.StyleLocation;
}

const resolveNumber = (value = 0) => Number.isFinite(value) ? value : 0;

const resolveFill = (fill: JSX.Fill | undefined, fallback: JSX.Fill) => fill ?? fallback;

export const component: JSX.RawFC<GraphProps, GraphRenderProps, undefined> = ({
  data,
  width,
  height = 100,
  margin = 4,
  location = "center",
  align = "left",
  min,
  max,
  color = "#9ca3af",
  fillColor,
  referenceColor = "rgba(255, 255, 255, 0.24)",
  referenceValue,
  lineWidth = 2,
  pointRadius = data.length <= 6 ? 2 : 0,
  smooth = false,
  padding = 8,
}) => ({
  dimension: {
    width,
    height,
    margin,
  },
  style: { location, direction: "row", align },
  props: {
    data,
    min,
    max,
    color,
    fillColor,
    referenceColor,
    referenceValue,
    lineWidth,
    pointRadius,
    smooth,
    padding,
  },
  children: undefined,
});

export const render: JSX.Render<GraphRenderProps> = (
  ctx: CanvasRenderingContext2D,
  {
    data,
    min,
    max,
    color,
    fillColor,
    referenceColor,
    referenceValue,
    lineWidth,
    pointRadius,
    smooth,
    padding,
  },
  { x, y, width, height }
) => {
  const values = data.map(resolveNumber);

  if (!values.length) return;

  const computedMin = min ?? Math.min(...values);
  const computedMax = max ?? Math.max(...values);
  const range = computedMax - computedMin || 1;

  const left = Math.round(x + padding);
  const top = Math.round(y + padding);
  const graphWidth = Math.max(1, Math.round(width - padding * 2));
  const graphHeight = Math.max(1, Math.round(height - padding * 2));
  const bottom = top + graphHeight;

  const pointFor = (value: number, index: number) => {
    const progress = values.length === 1 ? 0.5 : index / (values.length - 1);

    return {
      x: left + graphWidth * progress,
      y: bottom - ((value - computedMin) / range) * graphHeight,
    };
  };

  const points = values.map(pointFor);

  const renderLine = () => {
    ctx.beginPath();

    for (const [index, point] of points.entries()) {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
        continue;
      }

      const previous = points[index - 1];

      if (smooth) {
        const controlX = (previous.x + point.x) / 2;
        ctx.bezierCurveTo(controlX, previous.y, controlX, point.y, point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
  };

  if (typeof referenceValue === "number") {
    const referenceY = bottom - ((referenceValue - computedMin) / range) * graphHeight;

    if (referenceY >= top && referenceY <= bottom) {
      ctx.save();
      ctx.strokeStyle = resolveFill(referenceColor, "rgba(255, 255, 255, 0.24)");
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(left, referenceY);
      ctx.lineTo(left + graphWidth, referenceY);
      ctx.stroke();
      ctx.restore();
    }
  }

  if (fillColor) {
    renderLine();
    ctx.lineTo(left + graphWidth, bottom);
    ctx.lineTo(left, bottom);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  renderLine();
  ctx.strokeStyle = resolveFill(color, "#9ca3af");
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  if (!pointRadius) return;

  ctx.fillStyle = resolveFill(color, "#9ca3af");

  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
    ctx.fill();
  }
};
