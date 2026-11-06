/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Table } from "../../components/index.js";
import { WOOL_GAMES, cardColours } from "@statsify/catalog";
import { prettify } from "@statsify/util";
import type { LocalizeFunction } from "../../types.js";
import type { SheepWars } from "@statsify/schemas";

const colour = cardColours(WOOL_GAMES, "sheepwars");

export interface SheepWarsTableProps {
  sheepwars: SheepWars;
  t: LocalizeFunction;
}

export const SheepWarsTable = ({ sheepwars, t }: SheepWarsTableProps) => {
  const stats = sheepwars;

  return (
    <>
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
        <Table.td title={t("stats.losses")} value={t(stats.losses)} color={colour("losses")} />
        <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color={colour("wlr")} />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.kills")} value={t(stats.kills)} color={colour("kills")} />
        <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={colour("deaths")} />
        <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={colour("kdr")} />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.gamesPlayed")} value={t(stats.gamesPlayed)} color={colour("gamesPlayed")} />
        <Table.td title={t("stats.kit")} value={prettify(stats.kit)} color={colour("kit")} />
      </Table.tr>
    </>
  );
};
