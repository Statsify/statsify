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

export interface WarlordsDominationTableProps {
  warlords: Warlords;
  t: LocalizeFunction;
}

export const WarlordsDominationTable = ({ warlords, t }: WarlordsDominationTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(warlords.domination.wins)} color={colour("domination.wins")} />
      <Table.td title={t("stats.kills")} value={t(warlords.domination.kills)} color={colour("domination.kills")} />
      <Table.td title={t("stats.score")} value={t(warlords.domination.score)} color={colour("domination.score")} />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.capturePoints")} value={t(warlords.domination.capturePoints)} color={colour("domination.capturePoints")} />
      <Table.td title={t("stats.defendPoints")} value={t(warlords.domination.defendPoints)} color={colour("domination.defendPoints")} />
    </Table.tr>
  </Table.table>
);
