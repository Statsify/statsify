/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColors } from "@statsify/catalog";
import { Football } from "@statsify/schemas";
import { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";

const color = cardColors(ARCADE, "football");

interface FootballTableProps {
  stats: Football;
  t: LocalizeFunction;
}

export const FootballTable = ({ stats, t }: FootballTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
      <Table.td title={t("stats.goals")} value={t(stats.goals)} color={color("goals")} />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.kicks")} value={t(stats.kicks)} color={color("kicks")} />
      <Table.td title={t("stats.powerKicks")} value={t(stats.powerKicks)} color={color("powerKicks")} />
    </Table.tr>
  </Table.table>
);
