/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface RadarChartAxis {
  label: string;
  value: number;
  max?: number;
}

export interface RadarChartProps {
  axes: RadarChartAxis[];
  color?: string;
  fillColor?: string;
  secondarySeries?: RadarChartAxis[];
  secondaryColor?: string;
  secondaryFillColor?: string;
  size?: number;
}

type IntrinsicSeries = JSX.IntrinsicElements["radar"]["series"];

export const RadarChart = ({
  axes,
  color = "#9ca3af",
  fillColor = "rgba(156, 163, 175, 0.2)",
  secondarySeries,
  secondaryColor = "#4ade80",
  secondaryFillColor = "rgba(74, 222, 128, 0.15)",
  size = 160,
}: RadarChartProps) => {
  const normalizeAxes = (axisArr: RadarChartAxis[]) =>
    axisArr.map((a, i) => {
      const globalMax = axes[i]?.max ?? Math.max(1, ...axes.map((x) => x.value));
      return Math.max(0, Math.min(1, a.value / globalMax));
    });

  const primary = { values: normalizeAxes(axes), color, fillColor };

  const series: IntrinsicSeries = secondarySeries ?
    [primary, { values: normalizeAxes(secondarySeries), color: secondaryColor, fillColor: secondaryFillColor }] :
    [primary];

  return (
    <radar
      labels={axes.map((a) => a.label)}
      series={series}
      width={size}
      height={size}
    />
  );
};
