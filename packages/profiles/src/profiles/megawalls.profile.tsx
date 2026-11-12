/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, SidebarItem, Table } from "../components/index.js";
import { FormattedGame, type GameMode, MegaWallsModes } from "@statsify/schemas";
import { MEGAWALLS, cardColors } from "@statsify/catalog";
import { formatTime, prettify } from "@statsify/util";
import type { BaseProfileProps } from "../types.js";

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
  const color = cardColors(MEGAWALLS, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(megawalls.coins), color("coins")],
    [t("stats.mythic-favor"), t(megawalls.mythicFavor), color("mythicFavor")],
    [t("stats.class"), prettify(megawalls.class), color("class")],
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
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
          <Table.td title={t("stats.losses")} value={t(stats.losses)} color={color("losses")} />
          <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color={color("wlr")} />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.finalKills")}
            value={t(stats.finalKills)}
            color={color("finalKills")}
          />
          <Table.td
            title={t("stats.finalDeaths")}
            value={t(stats.finalDeaths)}
            color={color("finalDeaths")}
          />
          <Table.td title={t("stats.fkdr")} value={t(stats.fkdr)} color={color("fkdr")} />
          <Table.td
            title={t("stats.finalAssists")}
            value={t(stats.finalAssists)}
            color={color("finalAssists")}
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
            title={t("stats.playtime")}
            value={formatTime(stats.playtime)}
            color={color("playtime")}
          />
          <Table.td
            title={t("stats.witherDamage")}
            value={t(stats.witherDamage)}
            color={color("witherDamage")}
          />
          <Table.td
            title={t("stats.witherKills")}
            value={t(stats.witherKills)}
            color={color("witherKills")}
          />
          <Table.td title={t("stats.points")} value={t(stats.points)} color={color("points")} />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};

