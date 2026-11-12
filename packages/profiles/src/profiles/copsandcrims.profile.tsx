/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { COPS_AND_CRIMS, cardColors } from "@statsify/catalog";
import { Container, Footer, Header, Historical, SidebarItem, Table, formatProgression } from "../components/index.js";
import { CopsAndCrimsModes, FormattedGame, type GameMode } from "@statsify/schemas";
import { formatRecordTime } from "@statsify/util";
import type { BaseProfileProps } from "../types.js";

export interface CopsAndCrimsProfileProps extends BaseProfileProps {
  mode: GameMode<CopsAndCrimsModes>;
}

export const CopsAndCrimsProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: CopsAndCrimsProfileProps) => {
  const { copsandcrims } = player.stats;
  const color = cardColors(COPS_AND_CRIMS, mode.api);
  // The sidebar shows Overall's counts on every mode.
  const overallColor = cardColors(COPS_AND_CRIMS, "overall");

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(copsandcrims.coins), color("coins")],
    [t("stats.score"), t(copsandcrims.score), color("score")],
    [t("stats.knifeKills"), t(copsandcrims.overall.knifeKills), overallColor("knifeKills")],
    [t("stats.headshotKills"), t(copsandcrims.overall.headshotKills), overallColor("headshotKills")],
    [t("stats.grenadeKills"), t(copsandcrims.overall.grenadeKills), overallColor("grenadeKills")],
    [t("stats.shotsFired"), t(copsandcrims.overall.shotsFired), overallColor("shotsFired")],
  ];

  let table: JSX.Element;

  switch (mode.api) {
    case "defusal": {
      const stats = copsandcrims[mode.api];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
            <Table.td
              title={t("stats.roundWins")}
              value={t(stats.roundWins)}
              color={color("roundWins")}
            />
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
            <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
            <Table.td title={t("stats.assists")} value={t(stats.assists)} color={color("assists")} />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.bombsDefused")}
              value={t(stats.bombsDefused)}
              color={color("bombsDefused")}
            />
            <Table.td
              title={t("stats.bombsPlanted")}
              value={t(stats.bombsPlanted)}
              color={color("bombsPlanted")}
            />
          </Table.tr>
        </Table.table>
      );

      break;
    }
    case "deathmatch":
    case "overall": {
      const stats = copsandcrims[mode.api];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
            <Table.td title={t("stats.assists")} value={t(stats.assists)} color={color("assists")} />
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
            <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
          </Table.tr>
        </Table.table>
      );

      break;
    }
    case "gunGame": {
      const stats = copsandcrims[mode.api];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
            <Historical.exclude time={time}>
              <Table.td
                title={t("stats.bestTime")}
                value={formatRecordTime(stats.fastestWin)}
                color={color("fastestWin")}
              />
            </Historical.exclude>
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
            <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
            <Table.td title={t("stats.assists")} value={t(stats.assists)} color={color("assists")} />
          </Table.tr>
        </Table.table>
      );

      break;
    }
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.COPS_AND_CRIMS} §fStats §r(${mode.formatted})`}
        description={`§7${t("stats.level")}: ${copsandcrims.levelFormatted}\n${formatProgression({
          t,
          label: t("stats.progression.score"),
          progression: copsandcrims.progression,
          currentLevel: copsandcrims.naturalLevelFormatted,
          nextLevel: copsandcrims.nextLevelFormatted,
        })}`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
