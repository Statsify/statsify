import { JSX } from '@statsify/jsx';

export type RowData = [title: string, value: string | number, color?: string];

export interface RowProps {
  color?: string;
  data: RowData[];
  width?: number;
}

export const Row: JSX.FC<RowProps> = ({ color = '§f', data, width }) => {
  const length = data.length;
  const boxWidth = width ? (width - 8 * length) / length : (`${100 / length}%` as JSX.Percentage);

  return (
    <div width="100%">
      {data.map(([title, value, dataColor]) => (
        <div>
          <box width={boxWidth} direction="column" location="center">
            <text margin={{ top: 10, bottom: 4, left: 6, right: 6 }}>{`${
              dataColor ?? color
            }${title}`}</text>
            <text margin={{ top: 2, bottom: 12, left: 10, right: 10 }}>{`§^4^${
              dataColor ?? color
            }${value}`}</text>
          </box>
        </div>
      ))}
    </div>
  );
};
