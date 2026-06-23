/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface GraphPoint {
  label: string;
  value: number;
}

export interface GraphSeries {
  points: GraphPoint[];
  color?: JSX.IntrinsicElements["graph"]["color"];
  fillColor?: JSX.IntrinsicElements["graph"]["fillColor"];
  lineWidth?: number;
}

export interface GraphBand {
  min: number;
  max: number;
  color: string;
}

export interface GraphMarker {
  index: number;
  label?: string;
  color?: JSX.IntrinsicElements["graph"]["color"];
  radius?: number;
}

export interface GraphProps {
  points?: GraphPoint[];
  series?: GraphSeries[];
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  color?: JSX.IntrinsicElements["graph"]["color"];
  fillColor?: JSX.IntrinsicElements["graph"]["fillColor"];
  referenceValue?: number;
  min?: number;
  max?: number;
  baselineZero?: boolean;
  smooth?: boolean;
  showLabels?: boolean;
  bands?: GraphBand[];
  markers?: GraphMarker[];
  showLastValue?: boolean;
  lastPointColor?: JSX.IntrinsicElements["graph"]["color"];
}

export const Graph = ({
  points = [],
  series,
  width = "100%",
  height = 96,
  color = "#9ca3af",
  fillColor = "rgba(156, 163, 175, 0.14)",
  referenceValue,
  min,
  max,
  baselineZero,
  smooth = true,
  showLabels = true,
  bands,
  markers,
  showLastValue,
  lastPointColor,
}: GraphProps) => {
  const allPoints = [
    ...points,
    ...(series ?? []).flatMap((s) => s.points),
  ];
  const labelPoints = allPoints.length <= 5 ? points : [points[0], points.at(-1)].filter(Boolean) as GraphPoint[];

  const extraSeries = series?.map((s) => ({
    data: s.points.map((p) => p.value),
    color: s.color ?? "#9ca3af",
    fillColor: s.fillColor,
    lineWidth: s.lineWidth,
  }));

  return (
    <div width={width} direction="column">
      <graph
        width="100%"
        height={height}
        data={points.map((p) => p.value)}
        min={min}
        max={max}
        baselineZero={baselineZero}
        color={color}
        fillColor={fillColor}
        referenceValue={referenceValue}
        smooth={smooth}
        series={extraSeries}
        bands={bands}
        markers={markers}
        showLastPoint={showLastValue}
        lastPointColor={lastPointColor}
      />
      {showLabels && labelPoints.length ?
        (
          <div width="100%" location="center">
            {labelPoints.map((point) => (
              <text margin={{ top: 0, bottom: 2, left: 8, right: 8 }} size={1.5}>
                {`§7${point.label}`}
              </text>
            ))}
          </div>
        ) :
        <></>}
    </div>
  );
};
