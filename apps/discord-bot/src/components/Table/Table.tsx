import { JSX } from '@statsify/rendering';

export interface TableProps {
  width?: JSX.Measurement;
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
export const Table: JSX.FC<TableProps> = ({ width = '100%', children }) => (
  <div width={width} direction="column">
    {children}
  </div>
);
