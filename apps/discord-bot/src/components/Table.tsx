import { JSX } from '@statsify/jsx';
import { Row, RowProps } from './Row';

export interface TableProps {
  rows: RowProps[];
  width?: number;
}

export const Table: JSX.FC<TableProps> = ({ rows, width }) => (
  <div width="100%" direction="column">
    {rows.map((row) => (
      <Row {...row} width={width} />
    ))}
  </div>
);
