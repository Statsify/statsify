/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Table } from "#components";
import type { LocalizeFunction } from "@statsify/discord";
import type { Warlords } from "@statsify/schemas";

export interface WarlordsOverallTableProps {
  warlords: Warlords;
  t: LocalizeFunction;
}

export const WarlordsOverallTable = ({ warlords, t }: WarlordsOverallTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(warlords.wins)} color="§a" />
      <Table.td title={t("stats.losses")} value={t(warlords.losses)} color="§c" />
      <Table.td title={t("stats.wlr")} value={t(warlords.wlr)} color="§6" />
      <Table.td
        title={t("stats.gamesPlayed")}
        value={t(warlords.gamesPlayed)}
        color="§e"
      />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.kills")} value={t(warlords.kills)} color="§a" />
      <Table.td title={t("stats.deaths")} value={t(warlords.deaths)} color="§c" />
      <Table.td title={t("stats.kdr")} value={t(warlords.kdr)} color="§6" />
      <Table.td title={t("stats.assists")} value={t(warlords.assists)} color="§e" />
    </Table.tr>
  </Table.table>
);
