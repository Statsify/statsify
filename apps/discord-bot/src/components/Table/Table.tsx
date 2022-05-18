import { JSX } from '@statsify/jsx';

export interface TableProps {
  width?: JSX.Measurement;
}

export const Table: JSX.FC<TableProps> = ({ width = '100%', children }) => (
  <div width={width} direction="column">
    {children}
  </div>
);
