/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColors } from "@statsify/catalog";
import { GalaxyWars } from "@statsify/schemas";
import { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";

const color = cardColors(ARCADE, "galaxyWars");

interface GalaxyWarsTableProps {
  stats: GalaxyWars;
  t: LocalizeFunction;
}

export const GalaxyWarsTable = ({ stats, t }: GalaxyWarsTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
      <Table.td title={t("stats.rebelKills")} value={t(stats.rebelKills)} color={color("rebelKills")} />
      <Table.td title={t("stats.empireKills")} value={t(stats.empireKills)} color={color("empireKills")} />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
      <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
    </Table.tr>
  </Table.table>
);
