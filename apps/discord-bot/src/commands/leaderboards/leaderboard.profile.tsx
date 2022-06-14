import { Container, Footer } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { UserTier } from '@statsify/schemas';
import type { Image } from 'skia-canvas';

const formatPosition = (t: LocalizeFunction, position: number): string => {
  let color = '§f';

  if (position === 1) color = '§#ffd700';
  else if (position === 2) color = '§#c0c0c0';
  else if (position === 3) color = '§#cd7f32';

  return `${color}#§l${t(position)}`;
};

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
  tier?: UserTier;
  fields: string[];
  name: string;
  data: LeaderboardData[];
  t: LocalizeFunction;
}

export const LeaderboardProfile = ({
  background,
  logo,
  tier,
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
    const highlight = d.highlight
      ? { color: 'rgba(255, 255, 255, 0.35)', shadowOpacity: 0.3 }
      : undefined;

    add(
      <box width="100%" {...highlight}>
        <text>{formatPosition(t, d.position)}</text>
      </box>
    );

    add(
      <div width="100%">
        <box padding={{ left: 12, right: 12, top: 4, bottom: 4 }} {...highlight}>
          <img image={d.skin} />
        </box>
        <box width="remaining" direction="column" {...highlight}>
          <text align="left">{d.name}</text>
        </box>
      </div>
    );

    d.fields.forEach((field) => {
      const formatted = typeof field === 'number' ? t(field) : field;

      add(
        <box width="100%" {...highlight}>
          <text>{formatted}</text>
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
        {columnsList.map((c, index) => (
          <div direction="column" width={index === 1 ? 'remaining' : undefined}>
            {c}
          </div>
        ))}
      </div>
      <Footer
        logo={logo}
        tier={tier}
        border={{ bottomLeft: 4, bottomRight: 4, topLeft: 0, topRight: 0 }}
      />
    </Container>
  );
};
