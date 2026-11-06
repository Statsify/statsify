/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Table } from "../../../components/index.js";
import { WARLORDS, cardColours } from "@statsify/catalog";
import type { LocalizeFunction } from "../../../types.js";
import type { Warlords } from "@statsify/schemas";

const colour = cardColours(WARLORDS);

export interface WarlordsOverallTableProps {
  warlords: Warlords;
  t: LocalizeFunction;
}

export const WarlordsOverallTable = ({ warlords, t }: WarlordsOverallTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(warlords.wins)} color={colour("wins")} />
      <Table.td title={t("stats.losses")} value={t(warlords.losses)} color={colour("losses")} />
      <Table.td title={t("stats.wlr")} value={t(warlords.wlr)} color={colour("wlr")} />
      <Table.td
        title={t("stats.gamesPlayed")}
        value={t(warlords.gamesPlayed)}
        color={colour("gamesPlayed")}
      />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.kills")} value={t(warlords.kills)} color={colour("kills")} />
      <Table.td title={t("stats.deaths")} value={t(warlords.deaths)} color={colour("deaths")} />
      <Table.td title={t("stats.kdr")} value={t(warlords.kdr)} color={colour("kdr")} />
      <Table.td title={t("stats.assists")} value={t(warlords.assists)} color={colour("assists")} />
    </Table.tr>
  </Table.table>
);
