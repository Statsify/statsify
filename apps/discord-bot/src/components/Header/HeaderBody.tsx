import { JSX, useComponentHeight } from '@statsify/rendering';

export interface HeaderBodyProps {
  description: string;
  title: string;
  height?: number;
}

export const HeaderBody: JSX.FC<HeaderBodyProps> = ({
  description: descriptionStr,
  title: titleStr,
  height,
}) => {
  const title = (
    <box width="100%">
      <text>{titleStr}</text>
    </box>
  );

  const description = (
    <box width="100%" direction="column">
      {descriptionStr.split('\n').map((t) => (
        <text margin={1}>{t}</text>
      ))}
    </box>
  );

  if (height) {
    description.y.size = height - useComponentHeight(title);
  }

  return (
    <div direction="column">
      {description}
      {title}
    </div>
  );
};
