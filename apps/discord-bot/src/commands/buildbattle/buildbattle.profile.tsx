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
import type { BaseProfileProps } from "#commands/base.hypixel-command";

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
    [t("stats.perfectBuilds"), t(buildbattle.speedBuilders.perfectBuilds), "§e"],
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
        <Table.ts title={`§a${t("stats.wins")}`}>
          <Table.tr>
            <Table.td title="Overall" value={t(buildbattle.overall.wins)} color="§a" />
            <Table.td title="Pro" value={t(buildbattle.pro.wins)} color="§a" />
            <Table.td title="Speed Builders" value={t(buildbattle.speedBuilders.wins)} color="§a" />
          </Table.tr>
          <Table.tr>
            <Table.td title="Solo" value={t(buildbattle.solo.wins)} color="§a" />
            <Table.td title="Teams" value={t(buildbattle.teams.wins)} color="§a" />
            <Table.td title="GTB" value={t(buildbattle.guessTheBuild.wins)} color="§a" />
          </Table.tr>
        </Table.ts>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
