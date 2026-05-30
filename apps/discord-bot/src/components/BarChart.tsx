/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface BarChartItem {
  label: string;
  value: number;
  color?: JSX.IntrinsicElements["box"]["color"];
  formattedValue?: string;
}

export interface BarChartProps {
  items: BarChartItem[];
  width?: JSX.Measurement;
  max?: number;
  sort?: boolean;
  showValues?: boolean;
}

export const BarChart = ({
  items,
  width = "100%",
  max,
  sort = true,
  showValues = true,
}: BarChartProps) => {
  const sortedItems = sort ? [...items].sort((a, b) => b.value - a.value) : items;
  const maximum = max ?? Math.max(1, ...sortedItems.map((item) => item.value));

  return (
    <div width={width} direction="column">
      {sortedItems.map((item) => {
        const percentage = item.value > 0 ?
          Math.max(2, Math.min(100, Math.round((item.value / maximum) * 100))) :
          0;

        return (
          <box
            width="100%"
            direction="column"
            padding={{ top: 5, bottom: 5, left: 8, right: 8 }}
            margin={{ top: 2, bottom: 2, left: 4, right: 4 }}
          >
            <div width="100%">
              <text margin={{ top: 0, bottom: 3, left: 0, right: 4 }} size={1.75}>
                {`§7${item.label}`}
              </text>
              <div width="remaining" />
              {showValues ?
                (
                  <text margin={{ top: 0, bottom: 3, left: 4, right: 0 }} size={1.75}>
                    {item.formattedValue ?? item.value.toLocaleString()}
                  </text>
                ) :
                <></>}
            </div>
            <box
              width="100%"
              height={10}
              margin={0}
              padding={0}
              color="rgba(255, 255, 255, 0.12)"
              shadowDistance={0}
            >
              <box
                width={`${percentage}%`}
                height="100%"
                margin={0}
                padding={0}
                color={item.color ?? "#9ca3af"}
                shadowDistance={0}
              />
            </box>
          </box>
        );
      })}
    </div>
  );
};
