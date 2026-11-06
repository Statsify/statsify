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
import { TURBO_KART_RACERS, cardColours } from "@statsify/catalog";
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
  const colour = cardColours(TURBO_KART_RACERS);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(turbokartracers.coins), colour("coins")],
    [t("stats.tokens"), t(turbokartracers.tokens), colour("tokens")],
    [t("stats.boxesPickedUp"), t(turbokartracers.boxesPickedUp), colour("boxesPickedUp")],
    [t("stats.grandPrixTokens"), t(turbokartracers.grandPrixTokens), colour("grandPrixTokens")],
    [t("stats.lapsCompleted"), t(turbokartracers.lapsCompleted), colour("lapsCompleted")],
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
            color={colour("goldRate")}
          />
          <Table.td
            title={t("stats.trophyRate")}
            value={`${t(turbokartracers.trophyRate)}%`}
            color={colour("trophyRate")}
          />
          <Table.td
            title={t("stats.gamesPlayed")}
            value={t(turbokartracers.gamesPlayed)}
            color={colour("gamesPlayed")}
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.goldTrophies")}
            value={t(turbokartracers.gold)}
            color={colour("gold")}
          />
          <Table.td
            title={t("stats.silverTrophies")}
            value={t(turbokartracers.silver)}
            color={colour("silver")}
          />
          <Table.td
            title={t("stats.bronzeTrophies")}
            value={t(turbokartracers.bronze)}
            color={colour("bronze")}
          />
          <Table.td
            title={t("stats.totalTrophies")}
            value={t(turbokartracers.total)}
            color={colour("total")}
          />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
