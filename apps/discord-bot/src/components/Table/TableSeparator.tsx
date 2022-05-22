import { JSX, useComponentHeight } from '@statsify/rendering';

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
export const TableSeparator: JSX.FC<TableSeparatorProps> = ({ children, title }) => {
  const border = 4;

  const topDivider = (
    <box
      width="100%"
      border={{ topLeft: border, topRight: border, bottomLeft: 0, bottomRight: 0 }}
      padding={0}
    >
      {title ? <text margin={1}>§l{title}</text> : <div></div>}
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
    ></box>
  );

  return (
    <div width="100%" direction="column">
      {topDivider}
      <div width="100%" direction="column">
        {children}
      </div>
      {bottomDivider}
    </div>
  );
};
