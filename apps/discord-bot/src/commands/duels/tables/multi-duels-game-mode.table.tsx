/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseDuelsGameMode, MultiDuelsGameMode } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";
import { prettify } from "@statsify/util";

interface MultiDuelsGameModeModeTableProps {
  stats: BaseDuelsGameMode;
  title: string;
  t: LocalizeFunction;
}

const MultiDuelsGameModeModeTable = ({
  title,
  stats,
  t,
}: MultiDuelsGameModeModeTableProps) => (
  <Table.ts title={`§6${prettify(title)}`}>
    <Table.tr>
      <Table.td title={t("stats.winstreak")} value={t(stats.winstreak)} color="§e" />
      <Table.td
        title={t("stats.bestWinstreak")}
        value={t(stats.bestWinstreak)}
        color="§e"
      />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
      <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
    </Table.tr>
  </Table.ts>
);

interface MultiDuelsGameModeTableProps {
  stats: MultiDuelsGameMode;
  t: LocalizeFunction;
}

export const MultiDuelsGameModeTable = ({ stats, t }: MultiDuelsGameModeTableProps) => {
  const modes = ["overall", "solo", "doubles"] as const;

  return (
    <Table.table>
      <Table.tr>
        {modes.map((mode) => (
          <MultiDuelsGameModeModeTable title={mode} stats={stats[mode]} t={t} />
        ))}
      </Table.tr>
    </Table.table>
  );
};
