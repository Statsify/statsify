/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Badge,
  BarChart,
  Container,
  Footer,
  Graph,
  Header,
  Historical,
  SidebarItem,
  StatDelta,
  Table,
  formatProgression,
} from "#components";
import { BedWarsModes, FormattedGame, type GameMode } from "@statsify/schemas";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export interface BedWarsProfileProps extends BaseProfileProps {
  mode: GameMode<BedWarsModes>;
}

export const BedWarsProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: BedWarsProfileProps) => {
  const { bedwars } = player.stats;
  const stats = bedwars[mode.api];
  const modeWins = [
    { label: "Solo", value: bedwars.solo.wins || 0, color: "#4e79a7" },
    { label: "Doubles", value: bedwars.doubles.wins || 0, color: "#76b7b2" },
    { label: "3s", value: bedwars.threes.wins || 0, color: "#f28e2b" },
    { label: "4s", value: bedwars.fours.wins || 0, color: "#e15759" },
    { label: "4v4", value: bedwars["4v4"].wins || 0, color: "#9ca3af" },
  ];
  const ratioPoints = [
    { label: t("stats.wlr"), value: stats.wlr || 0 },
    { label: t("stats.fkdr"), value: stats.fkdr || 0 },
    { label: t("stats.kdr"), value: stats.kdr || 0 },
    { label: t("stats.bblr"), value: stats.bblr || 0 },
  ];
  const ratioAverage =
    ratioPoints.reduce((total, point) => total + point.value, 0) / ratioPoints.length;
  const fkdrDelta = (stats.fkdr || 0) - (bedwars.overall.fkdr || 0);

  const sidebar: SidebarItem[] = [
    [t("stats.tokens"), t(bedwars.tokens), "§2"],
    [t("stats.iron"), t(stats.itemsCollected.iron), "§7"],
    [t("stats.gold"), t(stats.itemsCollected.gold), "§6"],
    [t("stats.diamonds"), t(stats.itemsCollected.diamond), "§b"],
    [t("stats.emeralds"), t(stats.itemsCollected.emerald), "§2"],
  ];

  if (bedwars.slumber.wallet) sidebar.push(
    [t("stats.slumberTickets"), `${t(bedwars.slumber.tickets)}§7/${t(bedwars.slumber.wallet)}`, "§b"],
    [t("stats.totalSlumberTickets"), t(bedwars.slumber.totalTickets), "§d"]
  );

  if (time === "LIVE" && stats.winstreak) sidebar.push([t("stats.winstreak"), t(stats.winstreak), "§a"]);

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.BEDWARS} §fStats §r(${mode.formatted})`}
        description={`§7${t("stats.level")}: ${
          bedwars.levelFormatted
        }\n${formatProgression({
          t,
          label: t("stats.progression.exp"),
          progression: bedwars.progression,
          currentLevel: bedwars.levelFormatted,
          nextLevel: bedwars.nextLevelFormatted,
        })}`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
          <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
          <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.finalKills")}
            value={t(stats.finalKills)}
            color="§a"
          />
          <Table.td
            title={t("stats.finalDeaths")}
            value={t(stats.finalDeaths)}
            color="§c"
          />
          <Table.td title={t("stats.fkdr")} value={t(stats.fkdr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
          <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.bedsBroken")}
            value={t(stats.bedsBroken)}
            color="§a"
          />
          <Table.td title={t("stats.bedsLost")} value={t(stats.bedsLost)} color="§c" />
          <Table.td title={t("stats.bblr")} value={t(stats.bblr)} color="§6" />
        </Table.tr>
        <Historical.progression
          time={time}
          progression={bedwars.progression}
          current={bedwars.levelFormatted}
          next={bedwars.nextLevelFormatted}
          t={t}
          level={bedwars.level}
          exp={bedwars.exp}
        />
      </Table.table>
      <div width="100%">
        <box width="1/2" direction="column" location="left">
          <div width="100%">
            <text>§lMode Wins</text>
            <div width="remaining" />
            <Badge>§bVisual</Badge>
          </div>
          <BarChart items={modeWins} />
        </box>
        <box width="1/2" direction="column" location="left">
          <div width="100%">
            <text>§lRatio Profile</text>
            <div width="remaining" />
            <StatDelta value={fkdrDelta} />
          </div>
          <Graph
            points={ratioPoints}
            height={112}
            min={0}
            max={Math.max(1, ...ratioPoints.map((point) => point.value))}
            referenceValue={ratioAverage}
            color="#9ca3af"
            fillColor="rgba(156, 163, 175, 0.12)"
          />
        </box>
      </div>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
