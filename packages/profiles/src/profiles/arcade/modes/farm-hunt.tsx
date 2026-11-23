/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColors } from "@statsify/catalog";
import { FarmHunt } from "@statsify/schemas";
import { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";

const color = cardColors(ARCADE, "farmHunt");

interface FarmHuntTableProps {
  stats: FarmHunt;
  t: LocalizeFunction;
}

export const FarmHuntTable = ({ stats, t }: FarmHuntTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
        <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
        <Table.td title={t("stats.tauntsUsed")} value={t(stats.tauntsUsed)} color={color("tauntsUsed")} />
        <Table.td
          title={t("stats.poopCollected")}
          value={t(stats.poopCollected)}
          color={color("poopCollected")}
        />
      </Table.tr>
    </Table.ts>
    <Table.ts title="§6Animal">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.animalWins)} color={color("animalWins")} />
        <Table.td title={t("stats.kills")} value={t(stats.animalKills)} color={color("animalKills")} />
      </Table.tr>
    </Table.ts>
    <Table.ts title="§6Hunter">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.hunterWins)} color={color("hunterWins")} />
        <Table.td title={t("stats.kills")} value={t(stats.hunterKills)} color={color("hunterKills")} />
      </Table.tr>
    </Table.ts>
  </Table.table>
);
