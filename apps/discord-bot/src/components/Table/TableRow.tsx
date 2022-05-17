import { JSX } from '@statsify/jsx';

export interface TableRow {
  children: JSX.ElementNode[];
}

export const TableRow: JSX.FC<TableRow> = ({ children = [] }) => {
  const length = children.length;

  return (
    <div width="100%" direction="row">
      {children.map((child) => (
        <div width={`1/${length}`}>{child}</div>
      ))}
    </div>
  );
};
