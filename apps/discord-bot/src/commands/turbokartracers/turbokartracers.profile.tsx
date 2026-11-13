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
import { FormattedGame, type TurboKartRacersMap } from "@statsify/schemas";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
import type { LocalizeFunction } from "@statsify/discord";

const GOLD = "§#ffd700";
const SILVER = "§#c0c0c0";
const BRONZE = "§#cd7f32";

interface MapColumnProps {
  title: string;
  stats: TurboKartRacersMap;
  t: LocalizeFunction;
}

const MapColumn = ({ title, stats, t }: MapColumnProps) => (
  <Table.ts title={`§6${title}`}>
    <Table.td title={t("stats.gamesPlayed")} value={t(stats.gamesPlayed)} color="§a" size="small" />
    <Table.td title={t("stats.gold")} value={t(stats.gold)} color={GOLD} size="small" />
    <Table.td title={t("stats.silver")} value={t(stats.silver)} color={SILVER} size="small" />
    <Table.td title={t("stats.bronze")} value={t(stats.bronze)} color={BRONZE} size="small" />
  </Table.ts>
);

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
    [t("stats.bananaHitsSent"), t(turbokartracers.bananaHitsSent), "§e"],
    [t("stats.bananaHitsReceived"), t(turbokartracers.bananaHitsReceived), "§6"],
    [t("stats.torpedoHitsReceived"), t(turbokartracers.torpedoHitsReceived), "§9"],
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
            color="§6"
          />
          <Table.td
            title={t("stats.trophyRate")}
            value={`${t(turbokartracers.trophyRate)}%`}
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
            color={GOLD}
          />
          <Table.td
            title={t("stats.silverTrophies")}
            value={t(turbokartracers.silver)}
            color={SILVER}
          />
          <Table.td
            title={t("stats.bronzeTrophies")}
            value={t(turbokartracers.bronze)}
            color={BRONZE}
          />
          <Table.td
            title={t("stats.totalTrophies")}
            value={t(turbokartracers.total)}
            color="§a"
          />
        </Table.tr>
        <Table.tr>
          <MapColumn title="Retro" stats={turbokartracers.retro} t={t} />
          <MapColumn title="Canyon" stats={turbokartracers.canyon} t={t} />
          <MapColumn title="Olympus" stats={turbokartracers.olympus} t={t} />
          <MapColumn title="Hypixel GP" stats={turbokartracers.hypixelGP} t={t} />
          <MapColumn title="Jungle Rush" stats={turbokartracers.jungleRush} t={t} />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
