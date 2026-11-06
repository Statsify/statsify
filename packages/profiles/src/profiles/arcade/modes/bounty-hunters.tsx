/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColours } from "@statsify/catalog";
import { BountyHunters } from "@statsify/schemas";
import type { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";

const colour = cardColours(ARCADE, "bountyHunters");

interface BountyHuntersTableProps {
  stats: BountyHunters;
  t: LocalizeFunction;
}

export const BountyHuntersTable = ({ stats, t }: BountyHuntersTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
      <Table.td title={t("stats.bountyKills")} value={t(stats.bountyKills)} color={colour("bountyKills")} />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color={colour("kills")} />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={colour("deaths")} />
      <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={colour("kdr")} />
    </Table.tr>
  </Table.table>
);
