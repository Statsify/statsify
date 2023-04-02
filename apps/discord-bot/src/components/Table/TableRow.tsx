/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { useChildren } from "@statsify/rendering";

export interface TableRow {
  children: JSX.Children;
}

/**
 * @example
 * ```ts
 * <Table.tr>
 *  <Table.td title="Wins" value="1" color="§a" />
 *  <Table.td title="Losses" value="1" color="§c" />
 *  <Table.td title="WLR" value="1" color="§6" />
 * </Table.tr>
 * ```
 */
export const TableRow = ({ children: _children }: TableRow) => {
  const children = useChildren(_children);
  const length = children.length;

  return (
    <div width="100%" direction="row">
      {children.map((child) => (
        <div width={`1/${length}`}>{child}</div>
      ))}
    </div>
  );
};
