/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BUILD_BATTLE, cardColours } from "@statsify/catalog";
import {
  Container,
  Footer,
  Header,
  SidebarItem,
  Table,
  formatProgression,
} from "../components/index.js";
import { FormattedGame } from "@statsify/schemas";
import type { BaseProfileProps, LocalizeFunction } from "../types.js";

interface BuildBattleModeTableProps {
  title: string;
  stats: { wins: number };
  color: string;
  t: LocalizeFunction;
}

const BuildBattleModeTable = ({ title, stats, color, t }: BuildBattleModeTableProps) => (
  <Table.table width="remaining">
    <Table.ts title={`§e${title}`}>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color} />
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
  const colour = cardColours(BUILD_BATTLE);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(buildbattle.coins), colour("coins")],
    [t("stats.score"), t(buildbattle.score), colour("score")],
    [t("stats.votes"), t(buildbattle.votes), colour("votes")],
    [t("stats.superVotes"), t(buildbattle.superVotes), colour("superVotes")],
    [t("stats.correctGuesses"), t(buildbattle.correctGuesses), colour("correctGuesses")],
    [
      t("stats.perfectBuilds"),
      t(buildbattle.speedBuilders.perfectBuilds),
      colour("speedBuilders.perfectBuilds"),
    ],
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
        description={`§7${t("stats.title")}: ${
          buildbattle.titleFormatted
        }\n${formatProgression({
          t,
          label: t("stats.progression.score"),
          progression: buildbattle.progression,
          currentLevel: buildbattle.naturalTitleFormatted,
          nextLevel: buildbattle.nextTitleFormatted,
        })}`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <BuildBattleModeTable
            title="Overall"
            stats={buildbattle.overall}
            color={colour("overall.wins")}
            t={t}
          />
          <BuildBattleModeTable title="Pro" stats={buildbattle.pro} color={colour("pro.wins")} t={t} />
          <BuildBattleModeTable
            title="Speed Builders"
            stats={{ wins: buildbattle.speedBuilders.wins }}
            color={colour("speedBuilders.wins")}
            t={t}
          />
        </Table.tr>
        <Table.tr>
          <BuildBattleModeTable title="Solo" stats={buildbattle.solo} color={colour("solo.wins")} t={t} />
          <BuildBattleModeTable
            title="Teams"
            stats={buildbattle.teams}
            color={colour("teams.wins")}
            t={t}
          />
          <BuildBattleModeTable
            title="GTB"
            stats={buildbattle.guessTheBuild}
            color={colour("guessTheBuild.wins")}
            t={t}
          />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
