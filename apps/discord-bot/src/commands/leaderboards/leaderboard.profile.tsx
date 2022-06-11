import { Container, Footer } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import type { Image } from 'skia-canvas';

export interface LeaderboardData {
  name: string;
  fields: (number | string)[];
  skin: Image;
  position: number;
  highlight?: boolean;
}

export interface LeaderboardProfileProps {
  background: Image;
  logo: Image;
  premium?: boolean;
  fields: string[];
  name: string;
  data: LeaderboardData[];
  t: LocalizeFunction;
}

export const LeaderboardProfile = ({
  background,
  logo,
  premium,
  data,
  fields,
  name,
  t,
}: LeaderboardProfileProps) => {
  const columnsList: JSX.Element[][] = [];

  let column = 0;

  const add = (el: JSX.Element) => {
    if (columnsList[column]) columnsList[column].push(el);
    else columnsList[column] = [el];
    column++;
  };

  const reset = () => {
    column = 0;
  };

  ['Pos', 'Player', ...fields].forEach((field) =>
    add(
      <box width="100%" border={{ topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }}>
        <text>§l{field}</text>
      </box>
    )
  );

  reset();

  data.forEach((d) => {
    const isHighlighted = d.highlight ?? false;
    // const color = isHighlighted ? 'rgba(255, 255, 255, 0.5)' : undefined;
    const color = undefined;
    const prefix = isHighlighted ? '§l' : '';
    const outline = isHighlighted;

    add(
      <box width="100%" outline={outline} color={color}>
        <text>#§l{t(d.position) as string}</text>
      </box>
    );

    add(
      <div width="100%">
        <box padding={{ left: 12, right: 12, top: 4, bottom: 4 }} outline={outline} color={color}>
          <img image={d.skin} />
        </box>
        <box width="remaining" direction="column" outline={outline} color={color}>
          <text align="left">
            {prefix}
            {d.name}
          </text>
        </box>
      </div>
    );

    d.fields.forEach((field) => {
      const formatted = typeof field === 'number' ? t(field) : field;

      add(
        <box width="100%" outline={outline} color={color}>
          <text>
            {prefix}
            {formatted}
          </text>
        </box>
      );
    });

    reset();
  });

  return (
    <Container background={background}>
      <box width="100%">
        <text>§^3^§l{name}</text>
      </box>
      <div width="100%">
        {columnsList.map((c) => (
          <div direction="column">{c}</div>
        ))}
      </div>
      <Footer
        logo={logo}
        premium={premium}
        border={{ bottomLeft: 4, bottomRight: 4, topLeft: 0, topRight: 0 }}
      />
    </Container>
  );
};
