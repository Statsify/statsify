/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { COPS_AND_CRIMS, cardColours } from "@statsify/catalog";
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
  const colour = cardColours(COPS_AND_CRIMS, mode.api);
  // The sidebar shows Overall's counts on every mode.
  const overallColour = cardColours(COPS_AND_CRIMS, "overall");

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(copsandcrims.coins), colour("coins")],
    [t("stats.score"), t(copsandcrims.score), colour("score")],
    [t("stats.knifeKills"), t(copsandcrims.overall.knifeKills), overallColour("knifeKills")],
    [t("stats.headshotKills"), t(copsandcrims.overall.headshotKills), overallColour("headshotKills")],
    [t("stats.grenadeKills"), t(copsandcrims.overall.grenadeKills), overallColour("grenadeKills")],
    [t("stats.shotsFired"), t(copsandcrims.overall.shotsFired), overallColour("shotsFired")],
  ];

  let table: JSX.Element;

  switch (mode.api) {
    case "defusal": {
      const stats = copsandcrims[mode.api];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
            <Table.td
              title={t("stats.roundWins")}
              value={t(stats.roundWins)}
              color={colour("roundWins")}
            />
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(stats.kills)} color={colour("kills")} />
            <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={colour("deaths")} />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={colour("kdr")} />
            <Table.td title={t("stats.assists")} value={t(stats.assists)} color={colour("assists")} />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.bombsDefused")}
              value={t(stats.bombsDefused)}
              color={colour("bombsDefused")}
            />
            <Table.td
              title={t("stats.bombsPlanted")}
              value={t(stats.bombsPlanted)}
              color={colour("bombsPlanted")}
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
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
            <Table.td title={t("stats.assists")} value={t(stats.assists)} color={colour("assists")} />
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(stats.kills)} color={colour("kills")} />
            <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={colour("deaths")} />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={colour("kdr")} />
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
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
            <Historical.exclude time={time}>
              <Table.td
                title={t("stats.bestTime")}
                value={formatRecordTime(stats.fastestWin)}
                color={colour("fastestWin")}
              />
            </Historical.exclude>
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(stats.kills)} color={colour("kills")} />
            <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={colour("deaths")} />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={colour("kdr")} />
            <Table.td title={t("stats.assists")} value={t(stats.assists)} color={colour("assists")} />
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
