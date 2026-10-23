/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CanvasRenderingContext2D } from "skia-canvas";
import type * as JSX from "#jsx";

export interface GraphSeriesData {
  data: number[];
  color: JSX.Fill;
  fillColor?: JSX.Fill;
  lineWidth?: number;
}

export interface GraphBand {
  min: number;
  max: number;
  color: JSX.Fill;
}

export interface GraphMarker {
  index: number;
  label?: string;
  color?: JSX.Fill;
  radius?: number;
}

export interface GraphRenderProps {
  data: number[];
  min?: number;
  max?: number;
  baselineZero?: boolean;
  color: JSX.Fill;
  fillColor?: JSX.Fill;
  referenceColor?: JSX.Fill;
  referenceValue?: number;
  lineWidth: number;
  pointRadius: number;
  smooth: boolean;
  padding: number;
  series?: GraphSeriesData[];
  bands?: GraphBand[];
  markers?: GraphMarker[];
  showLastPoint?: boolean;
  lastPointColor?: JSX.Fill;
}

export interface GraphProps extends Partial<Omit<GraphRenderProps, "data">> {
  data?: number[];
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  align?: JSX.StyleLocation;
}

const resolveNumber = (value = 0) => Number.isFinite(value) ? value : 0;

const resolveFill = (fill: JSX.Fill | undefined, fallback: JSX.Fill) => fill ?? fallback;

export const component: JSX.RawFC<GraphProps, GraphRenderProps, undefined> = ({
  data = [],
  width,
  height = 100,
  margin = 4,
  location = "center",
  align = "left",
  min,
  max,
  baselineZero,
  color = "#9ca3af",
  fillColor,
  referenceColor = "rgba(255, 255, 255, 0.24)",
  referenceValue,
  lineWidth = 2,
  pointRadius = data.length <= 6 ? 2 : 0,
  smooth = false,
  padding = 8,
  series,
  bands,
  markers,
  showLastPoint,
  lastPointColor,
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
    baselineZero,
    color,
    fillColor,
    referenceColor,
    referenceValue,
    lineWidth,
    pointRadius,
    smooth,
    padding,
    series,
    bands,
    markers,
    showLastPoint,
    lastPointColor,
  },
  children: undefined,
});

const buildPoints = (
  values: number[],
  computedMin: number,
  range: number,
  left: number,
  bottom: number,
  graphWidth: number,
  graphHeight: number
) =>
  values.map((value, index) => {
    const progress = values.length === 1 ? 0.5 : index / (values.length - 1);
    return {
      x: left + graphWidth * progress,
      y: bottom - ((value - computedMin) / range) * graphHeight,
    };
  });

const tracePath = (
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  smooth: boolean
) => {
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

export const render: JSX.Render<GraphRenderProps> = (
  ctx: CanvasRenderingContext2D,
  {
    data,
    min,
    max,
    baselineZero,
    color,
    fillColor,
    referenceColor,
    referenceValue,
    lineWidth,
    pointRadius,
    smooth,
    padding,
    series,
    bands,
    markers,
    showLastPoint,
    lastPointColor,
  },
  { x, y, width, height }
) => {
  const allData = [
    ...data.map(resolveNumber),
    ...(series ?? []).flatMap((s) => s.data.map(resolveNumber)),
  ];

  if (!allData.length) return;

  const rawMin = min ?? Math.min(...allData);
  const computedMin = baselineZero ? Math.min(0, rawMin) : rawMin;
  const computedMax = max ?? Math.max(...allData);
  const range = computedMax - computedMin || 1;

  const left = Math.round(x + padding);
  const top = Math.round(y + padding);
  const graphWidth = Math.max(1, Math.round(width - padding * 2));
  const graphHeight = Math.max(1, Math.round(height - padding * 2));
  const bottom = top + graphHeight;

  const primaryValues = data.map(resolveNumber);

  const mkPoints = (values: number[]) =>
    buildPoints(values, computedMin, range, left, bottom, graphWidth, graphHeight);

  if (bands?.length) {
    ctx.save();
    for (const band of bands) {
      const bandTop = bottom - ((band.max - computedMin) / range) * graphHeight;
      const bandBottom = bottom - ((band.min - computedMin) / range) * graphHeight;
      if (bandBottom < top || bandTop > bottom) continue;
      ctx.fillStyle = band.color;
      ctx.fillRect(left, Math.max(top, bandTop), graphWidth, Math.min(bottom, bandBottom) - Math.max(top, bandTop));
    }
    ctx.restore();
  }

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

  const renderSeries = (
    values: number[],
    seriesColor: JSX.Fill,
    seriesFill: JSX.Fill | undefined,
    seriesLineWidth: number
  ) => {
    if (!values.length) return;
    const pts = mkPoints(values);

    if (seriesFill) {
      tracePath(ctx, pts, smooth);
      ctx.lineTo(left + graphWidth, bottom);
      ctx.lineTo(left, bottom);
      ctx.closePath();
      ctx.fillStyle = seriesFill;
      ctx.fill();
    }

    tracePath(ctx, pts, smooth);
    ctx.strokeStyle = resolveFill(seriesColor, "#9ca3af");
    ctx.lineWidth = seriesLineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  for (const s of series ?? []) {
    renderSeries(
      s.data.map(resolveNumber),
      s.color,
      s.fillColor,
      s.lineWidth ?? lineWidth
    );
  }

  renderSeries(primaryValues, color, fillColor, lineWidth);

  if (pointRadius && primaryValues.length) {
    const pts = mkPoints(primaryValues);
    ctx.fillStyle = resolveFill(color, "#9ca3af");
    for (const point of pts) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (markers?.length && primaryValues.length) {
    const pts = mkPoints(primaryValues);
    for (const marker of markers) {
      const pt = pts[marker.index];
      if (!pt) continue;
      ctx.beginPath();
      const r = marker.radius ?? pointRadius + 2;
      ctx.arc(pt.x, pt.y, Math.max(2, r), 0, Math.PI * 2);
      ctx.fillStyle = marker.color ?? color;
      ctx.fill();
    }
  }

  if (showLastPoint && primaryValues.length) {
    const pts = mkPoints(primaryValues);
    const last = pts.at(-1)!;
    const dotColor = lastPointColor ?? color;
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();
    const labelValue = primaryValues.at(-1)!;
    ctx.fillStyle = dotColor;
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(labelValue.toFixed(2), last.x - 2, last.y - 4);
  }
};
