/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HypixelSays } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";

interface HypixelSaysTableProps {
  stats: HypixelSays;
  t: LocalizeFunction;
}

export const HypixelSaysTable = ({ stats, t }: HypixelSaysTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
      <Table.td title={t("stats.roundWins")} value={t(stats.roundsWon)} color="§e" />
      <Table.td title={t("stats.points")} value={t(stats.points)} color="§b" />
    </Table.tr>
  </Table.table>
);
