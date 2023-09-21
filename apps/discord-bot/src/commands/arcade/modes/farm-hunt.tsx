/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FarmHunt } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";

interface FarmHuntTableProps {
  stats: FarmHunt;
  t: LocalizeFunction;
}

export const FarmHuntTable = ({ stats, t }: FarmHuntTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§e" />
        <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
        <Table.td title={t("stats.tauntsUsed")} value={t(stats.tauntsUsed)} color="§b" />
        <Table.td
          title={t("stats.poopCollected")}
          value={t(stats.poopCollected)}
          color="§#a7673f"
        />
      </Table.tr>
    </Table.ts>
    <Table.ts title="§6Animal">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.animalWins)} color="§e" />
        <Table.td title={t("stats.kills")} value={t(stats.animalKills)} color="§a" />
      </Table.tr>
    </Table.ts>
    <Table.ts title="§6Hunter">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.hunterWins)} color="§e" />
        <Table.td title={t("stats.kills")} value={t(stats.hunterKills)} color="§a" />
      </Table.tr>
    </Table.ts>
  </Table.table>
);
