/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColours } from "@statsify/catalog";
import type { LocalizeFunction } from "../../../types.js";
import { MiniWalls } from "@statsify/schemas";
import { Table } from "../../../components/index.js";
import { prettify } from "@statsify/util";

const color = cardColors(ARCADE, "miniWalls");

interface MiniWallsTableProps {
  stats: MiniWalls;
  t: LocalizeFunction;
}

export const MiniWallsTable = ({ stats, t }: MiniWallsTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.finalKills")} value={t(stats.finalKills)} color={color("finalKills")} />
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
      <Table.td title={t("stats.kit")} value={prettify(stats.kit)} color={color("kit")} />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
      <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
    </Table.tr>
    <Table.tr>
      <Table.td
        title={t("stats.witherKills")}
        value={t(stats.witherKills)}
        color={color("witherKills")}
      />
      <Table.td
        title={t("stats.witherDamage")}
        value={t(stats.witherDamage)}
        color={color("witherDamage")}
      />
    </Table.tr>
  </Table.table>
);
