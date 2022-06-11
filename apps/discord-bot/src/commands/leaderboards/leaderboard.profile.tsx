import { Container, Footer } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import type { Image } from 'skia-canvas';

export interface LeaderboardData {
  name: string;
  field: number | string;
  additionalFields: (number | string)[];
  skin: Image;
  position: number;
}

export interface LeaderboardProfileProps {
  background: Image;
  logo: Image;
  premium?: boolean;
  fieldName: string;
  additionalFieldNames: string[];
  data: LeaderboardData[];
  t: LocalizeFunction;
}

export const LeaderboardProfile = ({
  background,
  logo,
  premium,
  fieldName,
  additionalFieldNames,
  data,
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

  ['Pos', 'Player', fieldName, ...additionalFieldNames].forEach((field) =>
    add(
      <box width="100%" border={{ topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }}>
        <text>§l{field}</text>
      </box>
    )
  );

  reset();

  data.forEach((d) => {
    add(
      <box width="100%">
        <text>#§l{t(d.position) as string}</text>
      </box>
    );

    add(
      <div width="100%">
        <box padding={{ left: 12, right: 12, top: 4, bottom: 4 }}>
          <img image={d.skin} />
        </box>
        <box width="remaining" direction="column">
          <text align="left">{d.name}</text>
        </box>
      </div>
    );

    [d.field, ...d.additionalFields].forEach((field) => {
      const formatted = typeof field === 'number' ? t(field) : field;

      add(
        <box width="100%">
          <text>{formatted}</text>
        </box>
      );
    });

    reset();
  });

  return (
    <Container background={background}>
      <box width="100%">
        <text>§^3^§l{fieldName}</text>
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
