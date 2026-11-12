/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColours } from "@statsify/catalog";
import type { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";
import { ThrowOut } from "@statsify/schemas";

const color = cardColors(ARCADE, "throwOut");

interface ThrowOutTableProps {
  stats: ThrowOut;
  t: LocalizeFunction;
}

export const ThrowOutTable = ({ stats, t }: ThrowOutTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
      <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
    </Table.tr>
  </Table.table>
);
