/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseDuelsGameMode, MultiDuelsGameMode } from "@statsify/schemas";
import { Historical, Table } from "#components";
import { LocalizeFunction } from "@statsify/discord";
import { prettify } from "@statsify/util";
import type { ProfileTime } from "../../base.hypixel-command";

interface MultiDuelsGameModeModeTableProps {
  stats: BaseDuelsGameMode;
  title: string;
  t: LocalizeFunction;
  time: ProfileTime;
}

const MultiDuelsGameModeModeTable = ({
  title,
  stats,
  t,
  time,
}: MultiDuelsGameModeModeTableProps) => (
  <Table.ts title={`§6${prettify(title)}`}>
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
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
      <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
    </Table.tr>
  </Table.ts>
);

interface MultiDuelsGameModeTableProps {
  stats: MultiDuelsGameMode;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const MultiDuelsGameModeTable = ({
  stats,
  t,
  time,
}: MultiDuelsGameModeTableProps) => {
  const modes = ["overall", "solo", "doubles"] as const;

  return (
    <Table.table>
      <Table.tr>
        {modes.map((mode) => (
          <MultiDuelsGameModeModeTable
            title={mode}
            stats={stats[mode]}
            t={t}
            time={time}
          />
        ))}
      </Table.tr>
    </Table.table>
  );
};
