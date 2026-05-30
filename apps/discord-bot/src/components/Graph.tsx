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

export interface GraphProps {
  points: GraphPoint[];
  width?: JSX.Measurement;
  height?: JSX.Measurement;
  color?: JSX.IntrinsicElements["graph"]["color"];
  fillColor?: JSX.IntrinsicElements["graph"]["fillColor"];
  referenceValue?: number;
  min?: number;
  max?: number;
  smooth?: boolean;
  showLabels?: boolean;
}

export const Graph = ({
  points,
  width = "100%",
  height = 96,
  color = "#9ca3af",
  fillColor = "rgba(156, 163, 175, 0.14)",
  referenceValue,
  min,
  max,
  smooth = true,
  showLabels = true,
}: GraphProps) => {
  const labels = points.length <= 5 ? points : [points[0], points.at(-1)!];

  return (
    <div width={width} direction="column">
      <graph
        width="100%"
        height={height}
        data={points.map((point) => point.value)}
        min={min}
        max={max}
        color={color}
        fillColor={fillColor}
        referenceValue={referenceValue}
        smooth={smooth}
      />
      {showLabels && labels.length ?
        (
          <div width="100%" location="center">
            {labels.map((point) => (
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
