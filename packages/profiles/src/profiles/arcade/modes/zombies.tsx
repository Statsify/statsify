/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColors } from "@statsify/catalog";
import { ApiSubModeForMode, ArcadeModes, Zombies, ZombiesMapDifficulty } from "@statsify/schemas";
import { Historical, Table } from "../../../components/index.js";
import { formatRecordTime } from "@statsify/util";
import type { LocalizeFunction, ProfileTime } from "../../../types.js";

/** A map and difficulty's colors, by stat. */
type Colors = ReturnType<typeof cardColors>;

interface ZombiesMapColumnProps {
  title: string;
  stats: ZombiesMapDifficulty;
  color: Colors;
  t: LocalizeFunction;
  time: ProfileTime;
}

const ZombiesMapColumn = ({ title, stats, color, t, time }: ZombiesMapColumnProps) => {
  const mapStat = stats.wins >= 1 ?
    [t("stats.fastestWin"), formatRecordTime(stats.fastestWin)] :
    [t("stats.bestRound"), t(stats.bestRound)];

  return (
    <Table.ts title={title}>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} size="small" />
      <Historical.exclude time={time}>
        <Table.td
          title={mapStat[0]}
          value={mapStat[1]}
          // The overview draws a map's Fastest Win or Best Round in its own color; the catalog keeps the map's.
          color="§e"
          size="small"
        />
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
  const color = cardColors(ARCADE, "zombies.overall");

  return (
    <Table.table>
      <Table.ts title="§6Overall">
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(overall.wins)} color={color("wins")} />
          <Table.td title={t("stats.kills")} value={t(overall.kills)} color={color("kills")} />
          <Table.td title={t("stats.deaths")} value={t(overall.deaths)} color={color("deaths")} />
        </Table.tr>
      </Table.ts>
      <Table.tr>
        <ZombiesMapColumn
          title="§#813781Dead End"
          stats={deadEnd.overall}
          color={cardColors(ARCADE, "zombies.deadEnd.overall")}
          t={t}
          time={time}
        />
        <ZombiesMapColumn
          title="§#8f1721Bad Blood"
          stats={badBlood.overall}
          color={cardColors(ARCADE, "zombies.badBlood.overall")}
          t={t}
          time={time}
        />
        <ZombiesMapColumn
          title="§#75ae00Alien Arcadium"
          stats={alienArcadium}
          color={cardColors(ARCADE, "zombies.alienArcadium")}
          t={t}
          time={time}
        />
        <ZombiesMapColumn
          title="§#aaa5c2Prison"
          stats={prison.overall}
          color={cardColors(ARCADE, "zombies.prison.overall")}
          t={t}
          time={time}
        />
      </Table.tr>
    </Table.table>
  );
};

interface ZombiesMapDifficultyTableProps {
  stats: ZombiesMapDifficulty;
  color: Colors;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const ZombiesMapDifficultyTable = ({ stats, color, t, time }: ZombiesMapDifficultyTableProps) => (
  <>
    <Table.tr>
      {time === "LIVE" && stats.wins === 0 ?
        <Table.td title={t("stats.bestRound")} value={t(stats.bestRound)} color={color("bestRound")} /> :
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />}
      <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
      <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
    </Table.tr>
    <Historical.exclude time={time}>
      <Table.tr>
        <Table.td title={t("stats.fastestWin")} value={formatRecordTime(stats.fastestWin)} color={color("fastestWin")} size="small" />
        <Table.td title={t("stats.totalRounds")} value={t(stats.totalRounds)} color={color("totalRounds")} size="small" />
        <Table.td title={t("stats.doorsOpened")} value={t(stats.doorsOpened)} color={color("doorsOpened")} size="small" />
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
  <ZombiesMapDifficultyTable stats={stats[map]} color={cardColors(ARCADE, "zombies.alienArcadium")} t={t} time={time} /> :
  (
    <Table.table>
      <Table.tr>
        <Table.ts title="§6Overall">
          <ZombiesMapDifficultyTable
            stats={stats[map].overall}
            color={cardColors(ARCADE, `zombies.${map}.overall`)}
            t={t}
            time={time}
          />
        </Table.ts>
        <Table.ts title="§aNormal">
          <ZombiesMapDifficultyTable
            stats={stats[map].normal}
            color={cardColors(ARCADE, `zombies.${map}.normal`)}
            t={t}
            time={time}
          />
        </Table.ts>
      </Table.tr>
      <Table.tr>
        <Table.ts title="§cHard">
          <ZombiesMapDifficultyTable
            stats={stats[map].hard}
            color={cardColors(ARCADE, `zombies.${map}.hard`)}
            t={t}
            time={time}
          />
        </Table.ts>
        <Table.ts title="§4RIP">
          <ZombiesMapDifficultyTable
            stats={stats[map].rip}
            color={cardColors(ARCADE, `zombies.${map}.rip`)}
            t={t}
            time={time}
          />
        </Table.ts>
      </Table.tr>
    </Table.table>
  );
