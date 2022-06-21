/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { useComponentHeight } from "@statsify/rendering";

export interface TableSeparatorProps {
  title?: string;
  children: JSX.Children;
}

/**
 * @example
 * ```ts
 * <Table.ts title="Divider">
 *  <Table.tr>
 *    <Table.td title="Wins" value="1" color="§a" />
 *    <Table.td title="Losses" value="1" color="§c" />
 *    <Table.td title="WLR" value="1" color="§6" />
 *  </Table.tr>
 * </Table.ts>
 * ```
 */
export const TableSeparator = ({ children, title }: TableSeparatorProps) => {
  const border = 4;

  const topDivider = (
    <box
      width="100%"
      border={{ topLeft: border, topRight: border, bottomLeft: 0, bottomRight: 0 }}
      padding={0}
    >
      {title ? (
        <text margin={{ top: 1, left: 8, right: 8, bottom: 1 }}>§l{title}</text>
      ) : (
        <></>
      )}
    </box>
  );

  const topDividerHeight = title ? useComponentHeight(topDivider) : 15;
  topDivider.y.size = topDividerHeight;

  const bottomDivider = (
    <box
      width="100%"
      height={title ? Math.round(topDividerHeight / 2) : topDividerHeight}
      border={{ topLeft: 0, topRight: 0, bottomRight: border, bottomLeft: border }}
      padding={0}
    />
  );

  return (
    <div width="100%" direction="column" margin={{ top: 4, bottom: 4 }}>
      {topDivider}
      <div width="100%" direction="column">
        {children}
      </div>
      {bottomDivider}
    </div>
  );
};
