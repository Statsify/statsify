/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Container,
  Footer,
  Header,
  SidebarItem,
  Table,
  formatProgression,
} from "#components";
import { FormattedGame } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import type { BaseProfileProps } from "../base.hypixel-command";

interface BuildBattleModeTableProps {
  title: string;
  stats: { wins: number };
  t: LocalizeFunction;
}

const BuildBattleModeTable = ({ title, stats, t }: BuildBattleModeTableProps) => (
  <Table.table width="remaining">
    <Table.ts title={`§e${title}`}>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
    </Table.ts>
  </Table.table>
);

export const BuildBattleProfile = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  user,
  time,
}: BaseProfileProps) => {
  const { buildbattle } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(buildbattle.coins), "§6"],
    [t("stats.score"), t(buildbattle.score), "§a"],
    [t("stats.votes"), t(buildbattle.votes), "§c"],
    [t("stats.superVotes"), t(buildbattle.superVotes), "§b"],
    [t("stats.correctGuesses"), t(buildbattle.correctGuesses), "§9"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        historicalSidebar
        title={`§l${FormattedGame.BUILD_BATTLE} §fStats`}
        description={`§7Title: ${buildbattle.titleFormatted}\n${formatProgression({
          t,
          progression: buildbattle.progression,
          currentLevel: buildbattle.titleFormatted,
          nextLevel: buildbattle.nextTitleFormatted,
          showLevelWhenMaxed: false,
        })}`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <BuildBattleModeTable title="Overall" stats={buildbattle.overall} t={t} />
          <BuildBattleModeTable title="Pro" stats={buildbattle.pro} t={t} />
          <BuildBattleModeTable
            title="1.14"
            stats={{ wins: buildbattle.latestWins }}
            t={t}
          />
        </Table.tr>
        <Table.tr>
          <BuildBattleModeTable title="Solo" stats={buildbattle.solo} t={t} />
          <BuildBattleModeTable title="Teams" stats={buildbattle.teams} t={t} />
          <BuildBattleModeTable title="GTB" stats={buildbattle.guessTheBuild} t={t} />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
