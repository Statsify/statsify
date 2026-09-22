/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CanvasRenderingContext2D } from "skia-canvas";
import type * as JSX from "#jsx";

export interface HeatmapIntrinsicRenderProps {
  cells: number[];
  cols: number;
  cellSize: number;
  cellGap: number;
  cellRadius: number;
  lowColor: JSX.Fill;
  highColor: JSX.Fill;
  emptyColor: JSX.Fill;
}

export interface HeatmapIntrinsicProps extends Partial<Omit<HeatmapIntrinsicRenderProps, "cells" | "cols">> {
  cells: number[];
  cols: number;
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  align?: JSX.StyleLocation;
}

export const component: JSX.RawFC<HeatmapIntrinsicProps, HeatmapIntrinsicRenderProps, undefined> = ({
  cells,
  cols,
  cellSize = 12,
  cellGap = 2,
  cellRadius = 2,
  lowColor = "rgba(255,255,255,0.08)",
  highColor = "#4ade80",
  emptyColor = "rgba(255,255,255,0.04)",
  width,
  height,
  margin = 4,
  location = "left",
  align = "left",
}) => {
  const rows = Math.ceil(cells.length / cols);
  const computedWidth = width ?? cols * (cellSize + cellGap) - cellGap;
  const computedHeight = height ?? rows * (cellSize + cellGap) - cellGap;
  return {
    dimension: { width: computedWidth, height: computedHeight, margin },
    style: { location, direction: "row", align },
    props: { cells, cols, cellSize, cellGap, cellRadius, lowColor, highColor, emptyColor },
    children: undefined,
  };
};

const parseHexChannels = (s: string) => {
  const m = s.match(/[\da-f]{2}/gi);
  if (!m) return [0, 0, 0];
  return m.slice(0, 3).map((x) => Number.parseInt(x, 16));
};

const lerpColor = (a: string, b: string, t: number): string => {
  const [ar, ag, ab] = parseHexChannels(a);
  const [br, bg, bb] = parseHexChannels(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

export const render: JSX.Render<HeatmapIntrinsicRenderProps> = (
  ctx: CanvasRenderingContext2D,
  { cells, cols, cellSize, cellGap, cellRadius, lowColor, highColor, emptyColor },
  { x, y }
) => {
  const max = Math.max(1, ...cells);
  ctx.save();

  cells.forEach((value, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const cx = x + col * (cellSize + cellGap);
    const cy = y + row * (cellSize + cellGap);

    if (value === 0) {
      ctx.fillStyle = emptyColor;
    } else if (typeof lowColor === "string" && typeof highColor === "string") {
      ctx.fillStyle = lerpColor(lowColor, highColor, value / max);
    } else {
      ctx.fillStyle = highColor;
    }

    const r = cellRadius;
    ctx.beginPath();
    ctx.moveTo(cx + r, cy);
    ctx.lineTo(cx + cellSize - r, cy);
    ctx.arcTo(cx + cellSize, cy, cx + cellSize, cy + r, r);
    ctx.lineTo(cx + cellSize, cy + cellSize - r);
    ctx.arcTo(cx + cellSize, cy + cellSize, cx + cellSize - r, cy + cellSize, r);
    ctx.lineTo(cx + r, cy + cellSize);
    ctx.arcTo(cx, cy + cellSize, cx, cy + cellSize - r, r);
    ctx.lineTo(cx, cy + r);
    ctx.arcTo(cx, cy, cx + r, cy, r);
    ctx.closePath();
    ctx.fill();
  });

  ctx.restore();
};
