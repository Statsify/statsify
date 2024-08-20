/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface TableDataProps {
  title: string;
  value: string;
  color: string;
  size?: "small" | "regular" | "inline";
}

/**
 * @example
 * ```ts
 * <Table.td title="Wins" value="1" color="§a" />
 * ```
 */
export const TableData = ({ title, value, color, size = "regular" }: TableDataProps) => {
  if (size === "small") {
    return (
      <box
        direction="column"
        location="center"
        width="100%"
        padding={{ left: 5, right: 5 }}
      >
        <text
          margin={{ top: 6, bottom: 2, left: 1, right: 1 }}
        >{`${color}${title}`}
        </text>
        <text margin={{ top: 0, bottom: 6 }}>{`${color}${value}`}</text>
      </box>
    );
  }

  if (size === "inline") {
    return (
      <box width="100%" padding={{ left: 8, right: 8, top: 4, bottom: 4 }}>
        <text>§l{color}{title}</text>
        <div width="remaining" margin={{ left: 2, right: 2 }} />
        <text>{color}{value}</text>
      </box>
    );
  }

  return (
    <box direction="column" location="center" width="100%">
      <text margin={{ top: 8, bottom: 4, left: 6, right: 6 }}>{`${color}${title}`}</text>
      <text
        margin={{ top: 0, bottom: 8, left: 10, right: 10 }}
        size={4}
      >{`${color}${value}`}
      </text>
    </box>
  );
};
