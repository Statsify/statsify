/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Historical, Table } from "#components";
import { LocalizeFunction } from "@statsify/discord";
import { Zombies, ZombiesMap } from "@statsify/schemas";
import { formatTime } from "@statsify/util";
import type { ProfileTime } from "#commands/base.hypixel-command";

interface ZombiesMapColumnProps {
  title: string;
  stats: ZombiesMap;
  t: LocalizeFunction;
  time: ProfileTime;
}

const ZombiesMapColumn = ({ title, stats, t, time }: ZombiesMapColumnProps) => {
  const mapStat =
    stats.wins > 0
      ? [t("stats.fastestWin"), formatTime(stats.fastestWin)]
      : [t("stats.bestRound"), t(stats.bestRound)];

  return (
    <Table.ts title={title}>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" size="small" />
      <Historical.exclude time={time}>
        <Table.td title={mapStat[0]} value={mapStat[1]} color="§e" size="small" />
      </Historical.exclude>
    </Table.ts>
  );
};

export interface ZombiesTableProps {
  stats: Zombies;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const ZombiesTable = ({ stats, t, time }: ZombiesTableProps) => {
  const { overall, deadEnd, badBlood, alienArcadium } = stats;

  return (
    <Table.table>
      <Table.ts title="§6Overall">
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(overall.wins)} color="§a" />
          <Table.td title={t("stats.kills")} value={t(overall.kills)} color="§e" />
          <Table.td title={t("stats.deaths")} value={t(overall.deaths)} color="§c" />
        </Table.tr>
      </Table.ts>
      <Table.tr>
        <ZombiesMapColumn title="§#813781Dead End" stats={deadEnd} t={t} time={time} />
        <ZombiesMapColumn title="§#8f1721Bad Blood" stats={badBlood} t={t} time={time} />
        <ZombiesMapColumn
          title="§#75ae00Alien Arcadium"
          stats={alienArcadium}
          t={t}
          time={time}
        />
      </Table.tr>
    </Table.table>
  );
};
