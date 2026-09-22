/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface StatGridItem {
  label: string;
  value: string | number;
  color?: string;
}

export interface StatGridProps {
  items: StatGridItem[];
  columns?: number;
  width?: JSX.Measurement;
}

const DEFAULT_COLOR = "#9ca3af";

function chunk<T>(arr: T[], n: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += n) result.push(arr.slice(i, i + n));
  return result;
}

export const StatGrid = ({
  items,
  columns = 3,
  width = "100%",
}: StatGridProps) => {
  const rows = chunk(items, columns);

  return (
    <div width={width} direction="column">
      {rows.map((row) => (
        <div width="100%" direction="row">
          {row.map((item) => {
            const hex = item.color ?? DEFAULT_COLOR;
            const mcColor = hex.startsWith("#") ? `§#${hex.slice(1)}` : hex;

            return (
              <box
                width={`${Math.round(100 / columns)}%`}
                direction="column"
                padding={{ top: 5, bottom: 5, left: 8, right: 8 }}
                margin={{ top: 2, bottom: 2, left: 4, right: 4 }}
              >
                <text margin={{ top: 0, bottom: 3, left: 0, right: 0 }} size={1.5}>
                  {`§7${item.label}`}
                </text>
                <text margin={0} size={2}>
                  {`${mcColor}${typeof item.value === "number" ? item.value.toLocaleString() : item.value}`}
                </text>
              </box>
            );
          })}
        </div>
      ))}
    </div>
  );
};
