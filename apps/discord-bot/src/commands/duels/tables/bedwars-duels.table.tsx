/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Historical, Table } from "#components";
import type { BedWarsDuelsOverallMode } from "@statsify/schemas";
import type { LocalizeFunction } from "@statsify/discord";
import type { ProfileTime } from "#commands/base.hypixel-command";

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
          color="§e"
        />
        <Table.td
          title={t("stats.bestWinstreak")}
          value={t(stats.bestWinstreak)}
          color="§e"
        />
      </Table.tr>
    </Historical.exclude>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
      <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
      <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.finalKills")} value={t(stats.finalKills)} color="§a" />
      <Table.td title={t("stats.finalDeaths")} value={t(stats.finalDeaths)} color="§c" />
      <Table.td title={t("stats.fkdr")} value={t(stats.fkdr)} color="§6" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
      <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.bedsBroken")} value={t(stats.bedsBroken)} color="§a" />
      <Table.td title={t("stats.bedsLost")} value={t(stats.bedsLost)} color="§c" />
      <Table.td title={t("stats.bblr")} value={t(stats.bblr)} color="§6" />
    </Table.tr>
  </Table.table>
);
