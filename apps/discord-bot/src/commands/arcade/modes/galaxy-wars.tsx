/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GalaxyWars } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";

interface GalaxyWarsTableProps {
  stats: GalaxyWars;
  t: LocalizeFunction;
}

export const GalaxyWarsTable = ({ stats, t }: GalaxyWarsTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
      <Table.td title={t("stats.rebelKills")} value={t(stats.rebelKills)} color="§c" />
      <Table.td title={t("stats.empireKills")} value={t(stats.empireKills)} color="§6" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
      <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
    </Table.tr>
  </Table.table>
);
