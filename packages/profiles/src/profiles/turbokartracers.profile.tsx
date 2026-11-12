/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
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
} from "../components/index.js";
import { FormattedGame } from "@statsify/schemas";
import { TURBO_KART_RACERS, cardColors } from "@statsify/catalog";
import type { BaseProfileProps } from "../types.js";

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
  const color = cardColors(TURBO_KART_RACERS);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(turbokartracers.coins), color("coins")],
    [t("stats.tokens"), t(turbokartracers.tokens), color("tokens")],
    [t("stats.boxesPickedUp"), t(turbokartracers.boxesPickedUp), color("boxesPickedUp")],
    [t("stats.grandPrixTokens"), t(turbokartracers.grandPrixTokens), color("grandPrixTokens")],
    [t("stats.lapsCompleted"), t(turbokartracers.lapsCompleted), color("lapsCompleted")],
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
            value={`${t(turbokartracers.goldRate)}%`}
            color={color("goldRate")}
          />
          <Table.td
            title={t("stats.trophyRate")}
            value={`${t(turbokartracers.trophyRate)}%`}
            color={color("trophyRate")}
          />
          <Table.td
            title={t("stats.gamesPlayed")}
            value={t(turbokartracers.gamesPlayed)}
            color={color("gamesPlayed")}
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.goldTrophies")}
            value={t(turbokartracers.gold)}
            color={color("gold")}
          />
          <Table.td
            title={t("stats.silverTrophies")}
            value={t(turbokartracers.silver)}
            color={color("silver")}
          />
          <Table.td
            title={t("stats.bronzeTrophies")}
            value={t(turbokartracers.bronze)}
            color={color("bronze")}
          />
          <Table.td
            title={t("stats.totalTrophies")}
            value={t(turbokartracers.total)}
            color={color("total")}
          />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
