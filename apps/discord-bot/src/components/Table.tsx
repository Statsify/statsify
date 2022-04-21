import { JSX } from '@statsify/jsx';
import { Row, RowProps } from './Row';

export interface TableProps {
  rows: RowProps[];
}

export const Table: JSX.FC<TableProps> = ({ rows }) => (
  <div width="100%" direction="column">
    {rows.map((row) => (
      <Row {...row} />
    ))}
  </div>
);
