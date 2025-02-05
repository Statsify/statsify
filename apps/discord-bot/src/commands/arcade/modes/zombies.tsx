/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiSubModeForMode, ArcadeModes, Zombies, ZombiesMapDifficulty } from "@statsify/schemas";
import { Historical, Table } from "#components";
import { LocalizeFunction } from "@statsify/discord";
import { formatTime } from "@statsify/util";
import type { ProfileTime } from "#commands/base.hypixel-command";

interface ZombiesMapColumnProps {
  title: string;
  stats: ZombiesMapDifficulty;
  t: LocalizeFunction;
  time: ProfileTime;
}

const ZombiesMapColumn = ({ title, stats, t, time }: ZombiesMapColumnProps) => {
  const mapStat = stats.wins >= 1 ?
    [t("stats.fastestWin"), stats.fastestWin ? formatTime(stats.fastestWin) : "N/A"] :
    [t("stats.bestRound"), t(stats.bestRound)];

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
  const { overall, deadEnd, badBlood, alienArcadium, prison } = stats;

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
        <ZombiesMapColumn title="§#813781Dead End" stats={deadEnd.overall} t={t} time={time} />
        <ZombiesMapColumn title="§#8f1721Bad Blood" stats={badBlood.overall} t={t} time={time} />
        <ZombiesMapColumn
          title="§#75ae00Alien Arcadium"
          stats={alienArcadium}
          t={t}
          time={time}
        />
        <ZombiesMapColumn
          title="§#aaa5c2Prison"
          stats={prison.overall}
          t={t}
          time={time}
        />
      </Table.tr>
    </Table.table>
  );
};

interface ZombiesMapDifficultyTableProps {
  stats: ZombiesMapDifficulty;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const ZombiesMapDifficultyTable = ({ stats, t, time }: ZombiesMapDifficultyTableProps) => (
  <>
    <Table.tr>
      {time === "LIVE" && stats.wins === 0 ?
        <Table.td title={t("stats.bestRound")} value={t(stats.bestRound)} color="§a" /> :
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />}
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§e" />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
    </Table.tr>
    <Historical.exclude time={time}>
      <Table.tr>
        <Table.td title={t("stats.fastestWin")} value={stats.fastestWin ? formatTime(stats.fastestWin) : "N/A"} color="§b" size="small" />
        <Table.td title={t("stats.totalRounds")} value={t(stats.totalRounds)} color="§d" size="small" />
      </Table.tr>
    </Historical.exclude>
  </>
);

export interface ZombiesMapTableProps {
  stats: Zombies;
  t: LocalizeFunction;
  time: ProfileTime;
  map: Exclude<ApiSubModeForMode<ArcadeModes, "zombies">, "overall">;
}

export const ZombiesMapTable = ({ stats, t, time, map }: ZombiesMapTableProps) => map === "alienArcadium" ?
  <ZombiesMapDifficultyTable stats={stats[map]} t={t} time={time} /> :
  (
    <Table.table>
      <Table.tr>
        <Table.ts title="§6Overall">
          <ZombiesMapDifficultyTable stats={stats[map].overall} t={t} time={time} />
        </Table.ts>
        <Table.ts title="§aNormal">
          <ZombiesMapDifficultyTable stats={stats[map].normal} t={t} time={time} />
        </Table.ts>
      </Table.tr>
      <Table.tr>
        <Table.ts title="§cHard">
          <ZombiesMapDifficultyTable stats={stats[map].hard} t={t} time={time} />
        </Table.ts>
        <Table.ts title="§4RIP">
          <ZombiesMapDifficultyTable stats={stats[map].rip} t={t} time={time} />
        </Table.ts>
      </Table.tr>
    </Table.table>
  );
