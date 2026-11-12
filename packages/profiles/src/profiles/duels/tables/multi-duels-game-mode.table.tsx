/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DUELS, cardColors } from "@statsify/catalog";
import { Historical, Table } from "../../../components/index.js";
import { MultiPVPDuelsGameMode, PVPBaseDuelsGameMode } from "@statsify/schemas";
import { prettify } from "@statsify/util";
import type { LocalizeFunction, ProfileTime } from "../../../types.js";

interface MultiDuelsGameModeModeTableProps {
  stats: PVPBaseDuelsGameMode;
  title: string;
  /** Where the column's stats are, as `classic.solo`. */
  place: string;
  t: LocalizeFunction;
  time: ProfileTime;
}

const MultiDuelsGameModeModeTable = ({
  title,
  stats,
  place,
  t,
  time,
}: MultiDuelsGameModeModeTableProps) => {
  const color = cardColors(DUELS, place);

  return (
    <Table.ts title={`§6${prettify(title)}`}>
      <Historical.exclude time={time}>
        <Table.tr>
          <Table.td title={t("stats.winstreak")} value={t(stats.winstreak)} color={color("winstreak")} />
          <Table.td
            title={t("stats.bestWinstreak")}
            value={t(stats.bestWinstreak)}
            color={color("bestWinstreak")}
          />
        </Table.tr>
      </Historical.exclude>
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
        <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.losses")} value={t(stats.losses)} color={color("losses")} />
        <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color={color("wlr")} />
        <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
      </Table.tr>
    </Table.ts>
  );
};

interface MultiDuelsGameModeTableProps {
  stats: MultiPVPDuelsGameMode;
  /** The mode the stats are in, as `classic`. */
  place: string;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const MultiDuelsGameModeTable = ({
  stats,
  place,
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
            place={`${place}.${mode}`}
            t={t}
            time={time}
          />
        ))}
      </Table.tr>
    </Table.table>
  );
};
