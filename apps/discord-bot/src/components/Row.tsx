import { FontRenderer, JSX } from '@statsify/jsx';

export interface RowData {
  title: string;
  value: string;
  color?: string;
}

export interface RowProps {
  color?: string;
  data: RowData[];
  size?: number;
  renderer: FontRenderer;
}

export const Row: JSX.FC<RowProps> = ({ color = '§f', data, size = 3, renderer }) => (
  <div width="100%">
    {data.map((d) => (
      <box width={`${100 / data.length}%`} direction="column" location="center">
        <text renderer={renderer} margin={{ top: 10, bottom: 4, left: 6, right: 6 }}>{`${
          d.color ?? color
        }${d.title}`}</text>
        <text
          renderer={renderer}
          size={size}
          margin={{ top: 2, bottom: 12, left: 10, right: 10 }}
        >{`${d.color ?? color}${d.value}`}</text>
      </box>
    ))}
  </div>
);
