/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { If, Table } from "../../components/index.js";
import { WOOL_GAMES, cardColours } from "@statsify/catalog";
import type { LocalizeFunction } from "../../types.js";
import type { SubModeForMode, WoolGamesModes, WoolWars, WoolWarsOverall } from "@statsify/schemas";

export interface WoolWarsTableProps {
  woolwars: WoolWars;
  submode: SubModeForMode<WoolGamesModes, "woolwars">;
  t: LocalizeFunction;
}

export const WoolWarsTable = ({ woolwars, submode, t }: WoolWarsTableProps) => {
  const stats = woolwars[submode.api];
  const colour = cardColours(WOOL_GAMES, `woolwars.${submode.api}`);

  return (
    <>
      <If condition={submode.api === "overall"}>
        {() => {
          const overall = stats as WoolWarsOverall;

          return (
            <Table.tr>
              <Table.td title={t("stats.wins")} value={t(overall.wins)} color={colour("wins")} />
              <Table.td
                title={t("stats.losses")}
                value={t(overall.losses)}
                color={colour("losses")}
              />
              <Table.td title={t("stats.wlr")} value={t(overall.wlr)} color={colour("wlr")} />
            </Table.tr>
          );
        }}
      </If>
      <Table.tr>
        <Table.td title={t("stats.kills")} value={t(stats.kills)} color={colour("kills")} />
        <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={colour("deaths")} />
        <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={colour("kdr")} />
        <Table.td title={t("stats.assists")} value={t(stats.assists)} color={colour("assists")} />
      </Table.tr>
    </>
  );
};
