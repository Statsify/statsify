import { FontRenderer, JSX } from '@statsify/jsx';
import { Row, RowProps } from './Row';

export interface TableProps {
  rows: Omit<RowProps, 'renderer'>[];
  renderer: FontRenderer;
}

export const Table: JSX.FC<TableProps> = ({ rows, renderer }) => (
  <div width="100%" direction="column">
    {rows.map((row) => (
      <Row {...row} renderer={renderer} />
    ))}
  </div>
);
