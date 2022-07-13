/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command";
import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { FormattedGame, GameMode, MegaWallsModes } from "@statsify/schemas";
import { formatTime, prettify } from "@statsify/util";

export interface MegaWallsProfileProps extends BaseProfileProps {
  mode: GameMode<MegaWallsModes>;
}

export const MegaWallsProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: MegaWallsProfileProps) => {
  const { megawalls } = player.stats;
  const stats = megawalls[mode.api];

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(megawalls.coins), "§6"],
    [t("stats.mythic-favor"), t(megawalls.mythicFavor), "§e"],
    [t("stats.class"), prettify(megawalls.class), "§9"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.MEGAWALLS} §fStats §r(${mode.formatted})`}
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
          <Table.td
            title={t("stats.finalAssists")}
            value={t(stats.finalAssists)}
            color="§e"
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
            title={t("stats.playtime")}
            value={formatTime(stats.playtime)}
            color="§a"
          />
          <Table.td
            title={t("stats.witherDamage")}
            value={t(stats.witherDamage)}
            color="§c"
          />
          <Table.td
            title={t("stats.witherKills")}
            value={t(stats.witherKills)}
            color="§6"
          />
          <Table.td title={t("stats.points")} value={t(stats.points)} color="§e" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
