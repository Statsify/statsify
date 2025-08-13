/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Historical, If, Table } from "#components";
import { LocalizeFunction } from "@statsify/discord";
import { BaseDuelsGameMode, PVPBaseDuelsGameMode, SingleDuelsGameMode, SinglePVPDuelsGameMode } from "@statsify/schemas";
import type { ProfileTime } from "#commands/base.hypixel-command";

interface SingleDuelsGameModeTableProps {
  stats: SinglePVPDuelsGameMode | SingleDuelsGameMode | PVPBaseDuelsGameMode | BaseDuelsGameMode;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const SingleDuelsGameModeTable = ({
  stats,
  t,
  time,
}: SingleDuelsGameModeTableProps) => (
  <Table.table>
    <Historical.exclude time={time}>
      <Table.tr>
        <Table.td title={t("stats.winstreak")} value={t(stats.winstreak)} color="§e" />
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
    <If condition={"kills" in stats}>
      {() => {
        const s = stats as SinglePVPDuelsGameMode;
        return (
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(s.kills)} color="§a" />
            <Table.td title={t("stats.deaths")} value={t(s.deaths)} color="§c" />
            <Table.td title={t("stats.kdr")} value={t(s.kdr)} color="§6" />
          </Table.tr>
        );
      }}
    </If>
  </Table.table>
);
