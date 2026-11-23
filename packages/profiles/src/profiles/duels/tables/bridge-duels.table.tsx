/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DUELS, cardColors } from "@statsify/catalog";
import { Historical, Table } from "../../../components/index.js";
import type { BridgeDuelsMode } from "@statsify/schemas";
import type { LocalizeFunction, ProfileTime } from "../../../types.js";

export interface BridgeDuelsTableProps {
  stats: BridgeDuelsMode;
  /** The Bridge submode the stats are in, as `bridge.solo`. */
  place: string;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const BridgeDuelsTable = ({ stats, place, t, time }: BridgeDuelsTableProps) => {
  const color = cardColors(DUELS, place);

  return (
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
        <Table.td title={t("stats.goals")} value={t(stats.goals)} color={color("goals")} />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
        <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
        <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
      </Table.tr>
    </Table.table>
  );
};
