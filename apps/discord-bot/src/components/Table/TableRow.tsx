import { useChildren } from '@statsify/rendering';

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
