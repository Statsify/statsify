/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";
import { PVPBaseDuelsGameMode, UHCDuels } from "@statsify/schemas";
import { Table } from "#components";
import { prettify } from "@statsify/util";

interface UHCDuelsModeColumnProps {
  stats: PVPBaseDuelsGameMode;
  title: string;
  t: LocalizeFunction;
}

const UHCDuelsModeColumn = ({ title, stats, t }: UHCDuelsModeColumnProps) => (
  <Table.ts title={`§6${prettify(title)}`}>
    <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
    <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
    <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
    <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§b" />
  </Table.ts>
);

export interface UHCDuelsTableProps {
  stats: UHCDuels;
  t: LocalizeFunction;
}

export const UHCDuelsTable = ({ stats, t }: UHCDuelsTableProps) => {
  const modes = ["overall", "solo", "doubles", "fours", "deathmatch"] as const;

  return (
    <Table.table>
      <Table.tr>
        {modes.map((mode) => (
          <UHCDuelsModeColumn title={mode} stats={stats[mode]} t={t} />
        ))}
      </Table.tr>
    </Table.table>
  );
};
