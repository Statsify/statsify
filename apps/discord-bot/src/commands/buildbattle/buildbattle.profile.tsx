/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, SidebarItem, Table } from '#components';
import { FormattedGame } from '@statsify/schemas';
import { BaseProfileProps } from '../base.hypixel-command';

interface BuildBattleModeTableProps {
  title: string;
  stats: [string, string][];
  width?: JSX.Measurement;
}

const BuildBattleModeTable = ({ title, stats, width = 'remaining' }: BuildBattleModeTableProps) => {
  const colors = ['§a', '§6'];

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

export const BuildBattleProfile = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  tier,
  time,
}: BaseProfileProps) => {
  const { buildbattle } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(buildbattle.coins), '§6'],
    [t('stats.score'), t(buildbattle.score), '§a'],
    [t('stats.votes'), t(buildbattle.votes), '§c'],
    [t('stats.superVotes'), t(buildbattle.superVotes), '§b'],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.BUILD_BATTLE} §fStats`}
        description={`§dBuild Battle Title\n${buildbattle.titleFormatted}`}
        time={time}
      />
      <div width="100%">
        <BuildBattleModeTable
          title="Overall"
          stats={[[t('stats.wins'), t(buildbattle.overall.wins)]]}
        />
        <BuildBattleModeTable title="Pro" stats={[[t('stats.wins'), t(buildbattle.pro.wins)]]} />
        <BuildBattleModeTable title="1.14" stats={[[t('stats.wins'), t(buildbattle.latestWins)]]} />
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
      <Footer logo={logo} tier={tier} />
    </Container>
  );
};
