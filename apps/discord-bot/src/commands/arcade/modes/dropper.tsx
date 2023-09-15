/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { If, Table } from "#components";
import { formatTime } from "@statsify/util";
import type { Dropper } from "@statsify/schemas";
import type { LocalizeFunction } from "@statsify/discord";

interface DropperTableProps {
  stats: Dropper;
  t: LocalizeFunction;
}

export const DropperTable = ({ stats, t }: DropperTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
      <Table.td title={t("stats.fails")} value={t(stats.fails)} color="§c" />
      <Table.td title={t("stats.mapsCompleted")} value={t(stats.mapsCompleted)} color="§e" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.gamesFinished")} value={t(stats.gamesFinished)} color="§9" />
      <Table.td title={t("stats.gamesPlayed")} value={t(stats.gamesPlayed)} color="§d" />
    </Table.tr>
    <If condition={stats.bestTime > 0}>
      <Table.tr>
        <Table.td title={t("stats.bestTime")} value={formatTime(stats.bestTime)} color="§b" />
        <Table.td title={t("stats.flawlessGames")} value={t(stats.flawlessGames)} color="§2" />
      </Table.tr>
    </If>
  </Table.table>
);
