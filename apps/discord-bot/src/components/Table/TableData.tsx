import { JSX } from '@statsify/jsx';

export interface TableDataProps {
  title: string;
  value: string;
  color: string;
  size?: 'small' | 'regular';
}

/**
 * @example
 * ```ts
 * <Table.td title="Wins" value="1" color="§a" />
 * ```
 */
export const TableData: JSX.FC<TableDataProps> = ({ title, value, color, size = 'regular' }) => {
  if (size === 'small') {
    return (
      <box direction="column" location="center" width="100%">
        <text margin={{ top: 4, bottom: 2, left: 6, right: 6 }}>{`${color}${title}`}</text>
        <text margin={{ top: 2, bottom: 6, left: 10, right: 10 }}>{`§^${3}^${color}${value}`}</text>
      </box>
    );
  }

  return (
    <box direction="column" location="center" width="100%">
      <text margin={{ top: 6, bottom: 4, left: 6, right: 6 }}>{`${color}${title}`}</text>
      <text margin={{ top: 2, bottom: 8, left: 10, right: 10 }}>{`§^${4}^${color}${value}`}</text>
    </box>
  );
};
