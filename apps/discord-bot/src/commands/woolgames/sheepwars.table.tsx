/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Table } from "#components";
import { prettify } from "@statsify/util";
import type { LocalizeFunction } from "@statsify/discord";
import type { SheepWars } from "@statsify/schemas";

export interface SheepWarsTableProps {
  sheepwars: SheepWars;
  t: LocalizeFunction;
}

export const SheepWarsTable = ({ sheepwars, t }: SheepWarsTableProps) => {
  const stats = sheepwars;

  return (
    <>
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
        <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
        <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
        <Table.td title={t("stats.gamesPlayed")} value={t(stats.gamesPlayed)} color="§e" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
        <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
        <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.sheepThrown")} value={t(stats.sheepThrown)} color="§a" />
        <Table.td title={t("stats.magicWoolHit")} value={t(stats.magicWool)} color="§c" />
        <Table.td title={t("stats.kit")} value={prettify(stats.kit)} color="§6" />
      </Table.tr>
    </>
  );
};
