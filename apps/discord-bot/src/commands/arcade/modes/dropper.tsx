/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ArcadeModes, type Dropper, DropperMaps, MetadataScanner, type SubModesForMode } from "@statsify/schemas";
import { Historical, If, Table } from "#components";
import { arrayGroup, formatRaceTime, formatTime } from "@statsify/util";
import type { LocalizeFunction } from "@statsify/discord";
import type { ProfileTime } from "#commands/base.hypixel-command";

interface DropperTableProps {
  stats: Dropper;
  submode: SubModesForMode<ArcadeModes, "dropper">;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const DropperTable = ({ stats, submode, t, time }: DropperTableProps) => {
  if (submode.api === "overall") return (
    <Table.table>
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
        <Table.td title={t("stats.fails")} value={t(stats.fails)} color="§c" />
        <Table.td title={t("stats.mapsCompleted")} value={t(stats.mapsCompleted)} color="§e" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.gamesPlayed")} value={t(stats.gamesPlayed)} color="§b" />
        <Table.td title={t("stats.gamesFinished")} value={t(stats.gamesFinished)} color="§3" />
      </Table.tr>
      <If condition={stats.bestTime > 0}>
        <Table.tr>
          <Historical.exclude time={time}>
            <Table.td title={t("stats.bestTime")} value={formatTime(stats.bestTime)} color="§d" />
          </Historical.exclude>
          <Table.td title={t("stats.flawlessGames")} value={t(stats.flawlessGames)} color="§5" />
        </Table.tr>
      </If>
    </Table.table>
  );

  return <DropperMapsTable dropper={stats} t={t} stat={submode.api} />;
};

// This will return the leaderboard names for each dropper map, we only want the map names
const DROPPER_MAPS = MetadataScanner.scan(DropperMaps)
  .filter(([key]) => key.endsWith(".bestTime"))
  .map(([key, metadata]) => [
    key.replace(".bestTime", ""),
    metadata.leaderboard.name.replace(" Best Time", ""),
  ] as [keyof DropperMaps, string])
  .sort(([a], [b]) => a.localeCompare(b));

const HARD_DROPPER_MAP_GROUPS = arrayGroup(DROPPER_MAPS.filter(([_, name]) => name.startsWith("§c")), 4);
const MEDIUM_DROPPER_MAP_GROUPS = arrayGroup(DROPPER_MAPS.filter(([_, name]) => name.startsWith("§e")), 4);
const EASY_DROPPER_MAP_GROUPS = arrayGroup(DROPPER_MAPS.filter(([_, name]) => name.startsWith("§a")), 4);

interface DropperMapsTableProps {
  dropper: Dropper;
  t: LocalizeFunction;
  stat: Exclude<SubModesForMode<ArcadeModes, "dropper">["api"], "overall">;
}

const DropperMapsTable = ({ dropper, t, stat }: DropperMapsTableProps) => (
  <Table.table>
    <Table.ts title="§cHard">
      {HARD_DROPPER_MAP_GROUPS.map((group) => <DropperMapGroup dropper={dropper} group={group} stat={stat} t={t} />)}
    </Table.ts>
    <Table.ts title="§eMedium">
      {MEDIUM_DROPPER_MAP_GROUPS.map((group) => <DropperMapGroup dropper={dropper} group={group} stat={stat} t={t} />)}
    </Table.ts>
    <Table.ts title="§aEasy">
      {EASY_DROPPER_MAP_GROUPS.map((group) => <DropperMapGroup dropper={dropper} group={group} stat={stat} t={t} />)}
    </Table.ts>
  </Table.table>
);

interface DropperMapGroupProps extends DropperMapsTableProps {
  group: [keyof DropperMaps, string][];
}

const DropperMapGroup = ({ dropper, group, stat, t }: DropperMapGroupProps) => (
  <Table.tr>
    {group
      .map(([key, mapName]) => {
        const map = dropper.maps[key];
        let value;

        switch (stat) {
          case "bestTimes":
            value = map.bestTime === 0 ? "§7N/A" : formatRaceTime(map.bestTime);
            break;
          case "completions":
            value = t(map.completions);
            break;
        }

        return <Table.td title={mapName} value={value} size="inline" color="§f" />;
      })}
  </Table.tr>
);
