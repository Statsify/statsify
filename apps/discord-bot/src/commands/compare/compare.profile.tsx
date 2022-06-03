import { Container, Footer, Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { roundTo } from '@statsify/math';
import { JSX, useChildren } from '@statsify/rendering';
import { Player } from '@statsify/schemas';
import type { Image } from 'skia-canvas';

//TODO(jacobk999): For compare
/*
 - Refactor these components to sep files
 - Add some way to localize
 - Make a better format for inputting stats
 - Possibly have a way to compare strings
*/

interface CompareHeaderProps {
  head1: Image;
  head2: Image;
  name1: string;
  name2: string;
  title: string;
}

const CompareHeader: JSX.FC<CompareHeaderProps> = ({ head1, head2, name1, name2, title }) => {
  const headMargin = { top: 8, bottom: 8, left: 2, right: 2 };

  return (
    <div width="100%" direction="column">
      <div width="100%" direction="row">
        <box width="50%" border={{ topLeft: 4, topRight: 0, bottomLeft: 4, bottomRight: 0 }}>
          <img image={head1} margin={headMargin} />
          <div width="remaining" height="100%">
            <text>§^3^{name1}</text>
          </div>
        </box>
        <box width="50%" border={{ topLeft: 0, topRight: 4, bottomLeft: 0, bottomRight: 4 }}>
          <div width="remaining" height="100%">
            <text>§^3^{name2}</text>
          </div>
          <img image={head2} margin={headMargin} />
        </box>
      </div>
      <box width="100%">
        <text>{title}</text>
      </box>
    </div>
  );
};

interface CompareTdProps {
  title: string;
  value1: number;
  value2: number;
}

const CompareTd: JSX.FC<CompareTdProps> = ({ title, value1, value2 }) => {
  const difference = value1 - value2;
  const isEqual = difference === 0;
  const isFirstGreater = difference > 0;

  const firstColor = isEqual ? '§e' : isFirstGreater ? '§a' : '§c';
  const secondColor = isEqual ? '§e' : !isFirstGreater ? '§a' : '§c';

  const firstValueFormatted = `${firstColor}${value1}`;
  const secondValueFormatted = `${secondColor}${value2}`;
  const differenceFormatted = `${firstColor}${isEqual ? '=' : isFirstGreater ? '▲' : '▼'} ${roundTo(
    Math.abs(difference)
  )}`;

  return (
    <div direction="column" width="remaining">
      <box width="100%">
        <text>§e{title}</text>
      </box>
      <div width="100%" direction="row">
        <box
          width="50%"
          height="100%"
          border={{ bottomLeft: 4, topLeft: 4, bottomRight: 0, topRight: 0 }}
        >
          <text>§^3^{firstValueFormatted}</text>
        </box>
        <box
          width="50%"
          height="100%"
          border={{ bottomLeft: 0, topLeft: 0, bottomRight: 4, topRight: 4 }}
        >
          <text>§^3^{secondValueFormatted}</text>
        </box>
      </div>
      <box width="100%">
        <text>{differenceFormatted}</text>
      </box>
    </div>
  );
};

interface CompareTrProps {
  children: JSX.Children;
}

const CompareTr: JSX.FC<CompareTrProps> = ({ children: _children }) => {
  const children = useChildren(_children);

  return (
    <div margin={{ top: 4, bottom: 4 }} width="100%">
      <Table.tr>
        {children.map((data, index) => (
          <>
            {index !== 0 ? <div width={6} height={1} /> : <></>}
            {data}
          </>
        ))}
      </Table.tr>
    </div>
  );
};

export interface CompareProfileProps {
  head1: Image;
  head2: Image;
  background: Image;
  logo: Image;
  premium: boolean;
  player1: Player;
  player2: Player;
  t: LocalizeFunction;
}

export const CompareProfile: JSX.FC<CompareProfileProps> = ({
  background,
  logo,
  premium,
  head1,
  head2,
  player1,
  player2,
}) => {
  const bedwars1 = player1.stats.bedwars;
  const bedwars2 = player2.stats.bedwars;

  const stats1 = bedwars1.overall;
  const stats2 = bedwars2.overall;

  return (
    <Container background={background}>
      <CompareHeader
        head1={head1}
        head2={head2}
        name1={player1.prefixName}
        name2={player2.prefixName}
        title={'§l§cBed§fWars §fStats §r(Overall)'}
      />
      <Table.table>
        <CompareTr>
          <CompareTd title="Wins" value1={stats1.wins} value2={stats2.wins} />
          <CompareTd title="WLR" value1={stats1.wlr} value2={stats2.wlr} />
        </CompareTr>
        <CompareTr>
          <CompareTd title="Final Kills" value1={stats1.finalKills} value2={stats2.finalKills} />
          <CompareTd title="FKDR" value1={stats1.fkdr} value2={stats2.fkdr} />
        </CompareTr>
        <CompareTr>
          <CompareTd title="Kills" value1={stats1.kills} value2={stats2.kills} />
          <CompareTd title="KDR" value1={stats1.kdr} value2={stats2.kdr} />
        </CompareTr>
        <CompareTr>
          <CompareTd title="Beds Broken" value1={stats1.bedsBroken} value2={stats2.bedsBroken} />
          <CompareTd title="BBLR" value1={stats1.bblr} value2={stats2.bblr} />
        </CompareTr>
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
