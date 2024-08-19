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

export interface WarlordsDominationTableProps {
  warlords: Warlords;
  t: LocalizeFunction;
}

export const WarlordsDominationTable = ({ warlords, t }: WarlordsDominationTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(warlords.domination.wins)} color="§a" />
      <Table.td title={t("stats.kills")} value={t(warlords.domination.kills)} color="§e" />
      <Table.td title={t("stats.score")} value={t(warlords.domination.score)} color="§6" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.capturePoints")} value={t(warlords.domination.capturePoints)} color="§2" />
      <Table.td title={t("stats.defendPoints")} value={t(warlords.domination.defendPoints)} color="§b" />
    </Table.tr>
  </Table.table>
);
