/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColors } from "@statsify/catalog";
import { BlockingDead } from "@statsify/schemas";
import type { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";

const color = cardColors(ARCADE, "blockingDead");

interface BlockingDeadTableProps {
  stats: BlockingDead;
  t: LocalizeFunction;
}

export const BlockingDeadTable = ({ stats, t }: BlockingDeadTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
      <Table.td title={t("stats.headshots")} value={t(stats.headshots)} color={color("headshots")} />
    </Table.tr>
  </Table.table>
);
