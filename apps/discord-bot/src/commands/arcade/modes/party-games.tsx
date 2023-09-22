/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";
import { PartyGames } from "@statsify/schemas";
import { Table } from "#components";

interface PartyGamesTableProps {
  stats: PartyGames;
  t: LocalizeFunction;
}

export const PartyGamesTable = ({ stats, t }: PartyGamesTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
      <Table.td title={t("stats.roundWins")} value={t(stats.roundsWon)} color="§e" />
      <Table.td title={t("stats.starsEarned")} value={t(stats.starsEarned)} color="§6" />
    </Table.tr>
  </Table.table>
);
