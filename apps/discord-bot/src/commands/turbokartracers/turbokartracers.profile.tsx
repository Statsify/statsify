/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "#commands/base.hypixel-command";
import {
  Container,
  Footer,
  Header,
  SidebarItem,
  Table,
  formatProgression,
} from "#components";
import { FormattedGame } from "@statsify/schemas";

export const TurboKartRacersProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  t,
  time,
}: BaseProfileProps) => {
  const { turbokartracers } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(turbokartracers.coins), "§6"],
    [t("stats.tokens"), t(turbokartracers.tokens), "§e"],
    [t("stats.boxesPickedUp"), t(turbokartracers.boxesPickedUp), "§c"],
    [t("stats.grandPrixTokens"), t(turbokartracers.grandPrixTokens), "§b"],
    [t("stats.lapsCompleted"), t(turbokartracers.lapsCompleted), "§2"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.TURBO_KART_RACERS} §fStats`}
        description={`§7${t("stats.prefix")}: ${
          turbokartracers.naturalPrefix
        }\n${formatProgression({
          t,
          label: t("stats.progression.goldTrophy"),
          progression: turbokartracers.progression,
          currentLevel: turbokartracers.currentPrefix,
          nextLevel: turbokartracers.nextPrefix,
        })}`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <Table.td
            title={t("stats.goldRate")}
            value={`${turbokartracers.goldRate}%`}
            color="§6"
          />
          <Table.td
            title={t("stats.trophyRate")}
            value={`${turbokartracers.trophyRate}%`}
            color="§b"
          />
          <Table.td
            title={t("stats.gamesPlayed")}
            value={t(turbokartracers.gamesPlayed)}
            color="§a"
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.goldTrophies")}
            value={t(turbokartracers.gold)}
            color="§#ffd700"
          />
          <Table.td
            title={t("stats.silverTrophies")}
            value={t(turbokartracers.silver)}
            color="§#c0c0c0"
          />
          <Table.td
            title={t("stats.bronzeTrophies")}
            value={t(turbokartracers.bronze)}
            color="§#cd7f32"
          />
          <Table.td
            title={t("stats.totalTrophies")}
            value={t(turbokartracers.total)}
            color="§a"
          />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
