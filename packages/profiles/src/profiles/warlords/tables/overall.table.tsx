/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Table } from "../../../components/index.js";
import { WARLORDS, cardColors } from "@statsify/catalog";
import type { LocalizeFunction } from "../../../types.js";
import type { Warlords } from "@statsify/schemas";

const color = cardColors(WARLORDS);

export interface WarlordsOverallTableProps {
  warlords: Warlords;
  t: LocalizeFunction;
}

export const WarlordsOverallTable = ({ warlords, t }: WarlordsOverallTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(warlords.wins)} color={color("wins")} />
      <Table.td title={t("stats.losses")} value={t(warlords.losses)} color={color("losses")} />
      <Table.td title={t("stats.wlr")} value={t(warlords.wlr)} color={color("wlr")} />
      <Table.td
        title={t("stats.gamesPlayed")}
        value={t(warlords.gamesPlayed)}
        color={color("gamesPlayed")}
      />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.kills")} value={t(warlords.kills)} color={color("kills")} />
      <Table.td title={t("stats.deaths")} value={t(warlords.deaths)} color={color("deaths")} />
      <Table.td title={t("stats.kdr")} value={t(warlords.kdr)} color={color("kdr")} />
      <Table.td title={t("stats.assists")} value={t(warlords.assists)} color={color("assists")} />
    </Table.tr>
  </Table.table>
);
