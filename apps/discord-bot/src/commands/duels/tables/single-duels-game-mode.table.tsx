/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";
import { SingleDuelsGameMode } from "@statsify/schemas";
import { Table } from "#components";

interface SingleDuelsGameModeTableProps {
  stats: SingleDuelsGameMode;
  t: LocalizeFunction;
}

export const SingleDuelsGameModeTable = ({ stats, t }: SingleDuelsGameModeTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.winstreak")} value={t(stats.winstreak)} color="§e" />
      <Table.td
        title={t("stats.bestWinstreak")}
        value={t(stats.bestWinstreak)}
        color="§e"
      />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
      <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
      <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
      <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
    </Table.tr>
  </Table.table>
);
