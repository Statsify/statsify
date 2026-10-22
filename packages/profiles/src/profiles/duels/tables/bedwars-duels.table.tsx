/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DUELS, cardColours } from "@statsify/catalog";
import { Historical, Table } from "../../../components/index.js";
import type { BedWarsDuelsOverallMode } from "@statsify/schemas";
import type { LocalizeFunction, ProfileTime } from "../../../types.js";

const colour = cardColours(DUELS, "bedwars.overall");

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
          color={colour("winstreak")}
        />
        <Table.td
          title={t("stats.bestWinstreak")}
          value={t(stats.bestWinstreak)}
          color={colour("bestWinstreak")}
        />
      </Table.tr>
    </Historical.exclude>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
      <Table.td title={t("stats.losses")} value={t(stats.losses)} color={colour("losses")} />
      <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color={colour("wlr")} />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.finalKills")} value={t(stats.finalKills)} color={colour("finalKills")} />
      <Table.td title={t("stats.finalDeaths")} value={t(stats.finalDeaths)} color={colour("finalDeaths")} />
      <Table.td title={t("stats.fkdr")} value={t(stats.fkdr)} color={colour("fkdr")} />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color={colour("kills")} />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={colour("deaths")} />
      <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={colour("kdr")} />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.bedsBroken")} value={t(stats.bedsBroken)} color={colour("bedsBroken")} />
      <Table.td title={t("stats.bedsLost")} value={t(stats.bedsLost)} color={colour("bedsLost")} />
      <Table.td title={t("stats.bblr")} value={t(stats.bblr)} color={colour("bblr")} />
    </Table.tr>
  </Table.table>
);
