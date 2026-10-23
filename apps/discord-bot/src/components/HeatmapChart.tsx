/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface HeatmapChartProps {
  cells: number[];
  cols: number;
  rowLabels?: string[];
  colLabels?: string[];
  highColor?: JSX.IntrinsicElements["heatmap"]["highColor"];
  cellSize?: number;
  cellGap?: number;
}

export const HeatmapChart = ({
  cells,
  cols,
  rowLabels,
  colLabels,
  highColor = "#4ade80",
  cellSize = 12,
  cellGap = 2,
}: HeatmapChartProps) => (
  <div direction="column">
    {colLabels ?
      (
        <div direction="row" margin={{ top: 0, bottom: 2, left: 0, right: 0 }}>
          {colLabels.map((label) => (
            <div width={cellSize + cellGap} location="center">
              <text margin={0} size={1.25}>{`§8${label}`}</text>
            </div>
          ))}
        </div>
      ) :
      <></>}
    <div direction="row">
      {rowLabels ?
        (
          <div direction="column" margin={{ top: 0, bottom: 0, left: 0, right: 4 }}>
            {rowLabels.map((label) => (
              <div height={cellSize + cellGap} location="center">
                <text margin={0} size={1.25}>{`§8${label}`}</text>
              </div>
            ))}
          </div>
        ) :
        <></>}
      <heatmap
        cells={cells}
        cols={cols}
        highColor={highColor}
        cellSize={cellSize}
        cellGap={cellGap}
      />
    </div>
  </div>
);
