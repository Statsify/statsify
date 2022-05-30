import { JSX } from '@statsify/rendering';

export interface HeaderBodyProps {
  description: string;
  title: string;
}

export const HeaderBody: JSX.FC<HeaderBodyProps> = ({ description, title }) => {
  return (
    <div direction="column" width="remaining" height="remaining">
      <box
        width="100%"
        direction="column"
        height="remaining"
        padding={{ bottom: 5, left: 10, right: 10, top: 5 }}
      >
        {description.split('\n').map((t) => (
          <text margin={1}>{t}</text>
        ))}
      </box>
      <box width="100%">
        <text>{title}</text>
      </box>
    </div>
  );
};
