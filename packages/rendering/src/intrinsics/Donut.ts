/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type CanvasRenderingContext2D } from "skia-canvas";
import type * as JSX from "#jsx";

export interface DonutSegment {
  value: number;
  color: JSX.Fill;
  label?: string;
}

export interface DonutRenderProps {
  segments: DonutSegment[];
  innerRadius: number;
  gap: number;
  startAngle: number;
  labelColor: JSX.Fill;
  labelSize: number;
}

export interface DonutProps extends Partial<Omit<DonutRenderProps, "segments">> {
  segments: DonutSegment[];
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  margin?: JSX.Spacing;
  location?: JSX.StyleLocation;
  align?: JSX.StyleLocation;
}

export const component: JSX.RawFC<DonutProps, DonutRenderProps, undefined> = ({
  segments,
  innerRadius = 0.6,
  gap = 0.02,
  startAngle = -Math.PI / 2,
  labelColor = "#ffffff",
  labelSize = 11,
  width = 120,
  height = 120,
  margin = 4,
  location = "center",
  align = "center",
}) => ({
  dimension: { width, height, margin },
  style: { location, direction: "row", align },
  props: { segments, innerRadius, gap, startAngle, labelColor, labelSize },
  children: undefined,
});

export const render: JSX.Render<DonutRenderProps> = (
  ctx: CanvasRenderingContext2D,
  { segments, innerRadius, gap, startAngle, labelColor, labelSize },
  { x, y, width, height }
) => {
  const cx = x + width / 2;
  const cy = y + height / 2;
  const outerR = Math.max(1, Math.min(width, height) / 2 - 2);
  const innerR = outerR * Math.max(0, Math.min(0.99, innerRadius));

  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  if (total === 0) return;

  ctx.save();

  let angle = startAngle;

  for (const seg of segments) {
    const fraction = Math.max(0, seg.value) / total;
    const sweep = Math.max(0, Math.PI * 2 * fraction - gap);

    ctx.beginPath();
    ctx.arc(cx, cy, outerR, angle + gap / 2, angle + gap / 2 + sweep);
    if (innerR > 0) {
      ctx.arc(cx, cy, innerR, angle + gap / 2 + sweep, angle + gap / 2, true);
    } else {
      ctx.lineTo(cx, cy);
    }
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();

    if (seg.label && fraction > 0.06) {
      const midAngle = angle + gap / 2 + sweep / 2;
      const labelR = innerR + (outerR - innerR) * 0.5;
      ctx.fillStyle = labelColor;
      ctx.font = `bold ${labelSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(seg.label, cx + labelR * Math.cos(midAngle), cy + labelR * Math.sin(midAngle));
    }

    angle += Math.PI * 2 * fraction;
  }

  ctx.restore();
};
