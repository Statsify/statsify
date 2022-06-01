import { Container, Footer, Header, HeaderBody, SidebarItem, Table } from '#components';
import { JSX } from '@statsify/rendering';
import { BaseProfileProps } from './base.profile';

interface BuildBattleModeTableProps {
  title: string;
  stats: [string, string][];
  width?: JSX.Measurement;
}

const BuildBattleModeTable: JSX.FC<BuildBattleModeTableProps> = ({
  title,
  stats,
  width = 'remaining',
}) => {
  const colors = ['§b', '§5'];

  return (
    <Table.table width={width}>
      <Table.ts title={`§e${title}`}>
        {stats.map(([title, value], index) => (
          <Table.tr>
            <Table.td title={title} value={value} color={colors[index]} />
          </Table.tr>
        ))}
      </Table.ts>
    </Table.table>
  );
};

export const BuildBattleProfile: JSX.FC<BaseProfileProps> = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  premium,
}) => {
  const { buildbattle } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(buildbattle.coins), '§6'],
    [t('stats.score'), t(buildbattle.score), '§a'],
    [t('stats.votes'), t(buildbattle.votes), '§c'],
    [t('stats.superVotes'), t(buildbattle.superVotes), '§b'],
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody
          description={`§dBuild Battle Title\n${buildbattle.titleFormatted}`}
          title="§l§6Build Battle §fStats"
        />
      </Header>
      <div width="100%">
        <BuildBattleModeTable
          title="Overall"
          stats={[[t('stats.wins'), t(buildbattle.overall.wins)]]}
        />
        <BuildBattleModeTable title="Pro" stats={[[t('stats.wins'), t(buildbattle.pro.wins)]]} />
      </div>
      <div width="100%">
        <BuildBattleModeTable
          title="Solo"
          stats={[
            [t('stats.wins'), t(buildbattle.solo.wins)],
            [t('stats.maxPoints'), t(buildbattle.solo.maxPoints)],
          ]}
        />
        <BuildBattleModeTable
          title="Teams"
          stats={[
            [t('stats.wins'), t(buildbattle.teams.wins)],
            [t('stats.maxPoints'), t(buildbattle.teams.maxPoints)],
          ]}
        />
        <BuildBattleModeTable
          title="GTB"
          stats={[
            [t('stats.wins'), t(buildbattle.guessTheBuild.wins)],
            [t('stats.correctGuesses'), t(buildbattle.guessTheBuild.correctGuesses)],
          ]}
        />
      </div>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
