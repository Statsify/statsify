/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColours } from "@statsify/catalog";
import { FarmHunt } from "@statsify/schemas";
import type { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";

const colour = cardColours(ARCADE, "farmHunt");

interface FarmHuntTableProps {
  stats: FarmHunt;
  t: LocalizeFunction;
}

export const FarmHuntTable = ({ stats, t }: FarmHuntTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
        <Table.td title={t("stats.kills")} value={t(stats.kills)} color={colour("kills")} />
        <Table.td title={t("stats.tauntsUsed")} value={t(stats.tauntsUsed)} color={colour("tauntsUsed")} />
        <Table.td
          title={t("stats.poopCollected")}
          value={t(stats.poopCollected)}
          color={colour("poopCollected")}
        />
      </Table.tr>
    </Table.ts>
    <Table.ts title="§6Animal">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.animalWins)} color={colour("animalWins")} />
        <Table.td title={t("stats.kills")} value={t(stats.animalKills)} color={colour("animalKills")} />
      </Table.tr>
    </Table.ts>
    <Table.ts title="§6Hunter">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.hunterWins)} color={colour("hunterWins")} />
        <Table.td title={t("stats.kills")} value={t(stats.hunterKills)} color={colour("hunterKills")} />
      </Table.tr>
    </Table.ts>
  </Table.table>
);
