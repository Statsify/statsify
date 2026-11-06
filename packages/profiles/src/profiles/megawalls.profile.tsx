/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, SidebarItem, Table } from "../components/index.js";
import { FormattedGame, type GameMode, MegaWallsModes } from "@statsify/schemas";
import { MEGAWALLS, cardColours } from "@statsify/catalog";
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
  const colour = cardColours(MEGAWALLS, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(megawalls.coins), colour("coins")],
    [t("stats.mythic-favor"), t(megawalls.mythicFavor), colour("mythicFavor")],
    [t("stats.class"), prettify(megawalls.class), colour("class")],
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
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
          <Table.td title={t("stats.losses")} value={t(stats.losses)} color={colour("losses")} />
          <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color={colour("wlr")} />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.finalKills")}
            value={t(stats.finalKills)}
            color={colour("finalKills")}
          />
          <Table.td
            title={t("stats.finalDeaths")}
            value={t(stats.finalDeaths)}
            color={colour("finalDeaths")}
          />
          <Table.td title={t("stats.fkdr")} value={t(stats.fkdr)} color={colour("fkdr")} />
          <Table.td
            title={t("stats.finalAssists")}
            value={t(stats.finalAssists)}
            color={colour("finalAssists")}
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
            title={t("stats.playtime")}
            value={formatTime(stats.playtime)}
            color={colour("playtime")}
          />
          <Table.td
            title={t("stats.witherDamage")}
            value={t(stats.witherDamage)}
            color={colour("witherDamage")}
          />
          <Table.td
            title={t("stats.witherKills")}
            value={t(stats.witherKills)}
            color={colour("witherKills")}
          />
          <Table.td title={t("stats.points")} value={t(stats.points)} color={colour("points")} />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};

