/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export interface TableProps {
  width?: JSX.Measurement;
  children: JSX.Children;
}

/**
 * @example
 * ```ts
 * <Table.table width="100%">
 *  <Table.tr>
 *    <Table.td title="Wins" value="1" color="§a" />
 *    <Table.td title="Losses" value="1" color="§c" />
 *    <Table.td title="WLR" value="1" color="§6" />
 *  </Table.tr>
 *  <Table.ts title="Divider">
 *   <Table.tr>
 *    <Table.td title="Wins" value="1" color="§a" />
 *    <Table.td title="Losses" value="1" color="§c" />
 *    <Table.td title="WLR" value="1" color="§6" />
 *   </Table.tr>
 *  </Table.ts>
 * </Table.table>
 * ```
 */
export const Table = ({ width = "100%", children }: TableProps) => (
  <div width={width} direction="column">
    {children}
  </div>
);
