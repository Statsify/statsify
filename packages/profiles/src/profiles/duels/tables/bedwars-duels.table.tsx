/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DUELS, cardColors } from "@statsify/catalog";
import { Historical, Table } from "../../../components/index.js";
import type { BedWarsDuelsOverallMode } from "@statsify/schemas";
import type { LocalizeFunction, ProfileTime } from "../../../types.js";

const color = cardColors(DUELS, "bedwars.overall");

export interface BedWarsDuelsTableProps {
  stats: BedWarsDuelsOverallMode;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const BedWarsDuelsTable = ({ stats, t, time }: BedWarsDuelsTableProps) => (
  <Table.table>
    <Historical.exclude time={time}>
      <Table.tr>
        <Table.td
          title={t("stats.winstreak")}
          value={t(stats.winstreak)}
          color={color("winstreak")}
        />
        <Table.td
          title={t("stats.bestWinstreak")}
          value={t(stats.bestWinstreak)}
          color={color("bestWinstreak")}
        />
      </Table.tr>
    </Historical.exclude>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
      <Table.td title={t("stats.losses")} value={t(stats.losses)} color={color("losses")} />
      <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color={color("wlr")} />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.finalKills")} value={t(stats.finalKills)} color={color("finalKills")} />
      <Table.td title={t("stats.finalDeaths")} value={t(stats.finalDeaths)} color={color("finalDeaths")} />
      <Table.td title={t("stats.fkdr")} value={t(stats.fkdr)} color={color("fkdr")} />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
      <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.bedsBroken")} value={t(stats.bedsBroken)} color={color("bedsBroken")} />
      <Table.td title={t("stats.bedsLost")} value={t(stats.bedsLost)} color={color("bedsLost")} />
      <Table.td title={t("stats.bblr")} value={t(stats.bblr)} color={color("bblr")} />
    </Table.tr>
  </Table.table>
);
