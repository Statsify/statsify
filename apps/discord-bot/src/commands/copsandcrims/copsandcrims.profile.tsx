/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, Historical, SidebarItem, Table } from "#components";
import { CopsAndCrimsModes, FormattedGame, GameMode } from "@statsify/schemas";
import { formatTime } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

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

  const sidebar: SidebarItem[] = [[t("stats.coins"), t(copsandcrims.coins), "§6"]];

  let table: JSX.Element;

  switch (mode.api) {
    case "defusal": {
      const stats = copsandcrims[mode.api];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
            <Table.td
              title={t("stats.roundWins")}
              value={t(stats.roundWins)}
              color="§b"
            />
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
            <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
            <Table.td title={t("stats.assists")} value={t(stats.assists)} color="§e" />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.bombsDefused")}
              value={t(stats.bombsDefused)}
              color="§a"
            />
            <Table.td
              title={t("stats.bombsPlanted")}
              value={t(stats.bombsPlanted)}
              color="§c"
            />
            <Table.td
              title={t("stats.headshotKills")}
              value={t(stats.headshotKills)}
              color="§6"
            />
          </Table.tr>
        </Table.table>
      );

      break;
    }
    case "overall":
    case "deathmatch": {
      const stats = copsandcrims[mode.api];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§e" />
            <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
            <Table.td title={t("stats.assists")} value={t(stats.assists)} color="§e" />
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
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
            <Historical.exclude time={time}>
              <Table.td
                title={t("stats.bestTime")}
                value={formatTime(stats.fastestWin)}
                color="§b"
              />
            </Historical.exclude>
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
            <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
            <Table.td title={t("stats.assists")} value={t(stats.assists)} color="§e" />
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
        description={`§7${t("stats.prefix")}: ${copsandcrims.naturalPrefix}`}
        time={time}
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
