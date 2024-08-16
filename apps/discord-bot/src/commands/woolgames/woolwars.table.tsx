/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { If, Table } from "#components";
import type { LocalizeFunction } from "@statsify/discord";
import type { SubModesForMode, WoolGamesModes, WoolWars } from "@statsify/schemas";

export interface WoolWarsTableProps {
  woolwars: WoolWars;
  submode: SubModesForMode<WoolGamesModes, "woolwars">;
  t: LocalizeFunction;
}

export const WoolWarsTable = ({ woolwars, submode, t }: WoolWarsTableProps) => {
  const stats = woolwars.overall;

  return (
    <>
      <If condition={submode.api === "overall"}>
        {() => (
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
            <Table.td
              title={t("stats.losses")}
              value={t(stats.losses)}
              color="§c"
            />
            <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
          </Table.tr>
        )}
      </If>
      <Table.tr>
        <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
        <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
        <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
        <Table.td title={t("stats.assists")} value={t(stats.assists)} color="§e" />
      </Table.tr>
    </>
  );
};
