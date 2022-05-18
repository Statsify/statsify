import { JSX, useChildren } from '@statsify/jsx';

export interface TableRow {
  children: JSX.Children;
}

export const TableRow: JSX.FC<TableRow> = ({ children: _children }) => {
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
