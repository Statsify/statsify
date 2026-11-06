/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseDuelsGameMode, PVPBaseDuelsGameMode, SingleDuelsGameMode, SinglePVPDuelsGameMode } from "@statsify/schemas";
import { DUELS, cardColours } from "@statsify/catalog";
import { Historical, If, Table } from "../../../components/index.js";
import type { LocalizeFunction, ProfileTime } from "../../../types.js";

interface SingleDuelsGameModeTableProps {
  stats: SinglePVPDuelsGameMode | SingleDuelsGameMode | PVPBaseDuelsGameMode | BaseDuelsGameMode;
  /** Where the stats are: a mode (`sumo`) or one of its submodes (`uhc.solo`). */
  place: string;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const SingleDuelsGameModeTable = ({
  stats,
  place,
  t,
  time,
}: SingleDuelsGameModeTableProps) => {
  const colour = cardColours(DUELS, place);

  return (
    <Table.table>
      <Historical.exclude time={time}>
        <Table.tr>
          <Table.td title={t("stats.winstreak")} value={t(stats.winstreak)} color={colour("winstreak")} />
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
      <If condition={"kills" in stats}>
        {() => {
          const s = stats as SinglePVPDuelsGameMode;
          return (
            <Table.tr>
              <Table.td title={t("stats.kills")} value={t(s.kills)} color={colour("kills")} />
              <Table.td title={t("stats.deaths")} value={t(s.deaths)} color={colour("deaths")} />
              <Table.td title={t("stats.kdr")} value={t(s.kdr)} color={colour("kdr")} />
            </Table.tr>
          );
        }}
      </If>
    </Table.table>
  );
};
