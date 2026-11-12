/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, DROPPER_DIFFICULTIES, cardColors } from "@statsify/catalog";
import type { ArcadeModes, Dropper, DropperMaps, SubModeForMode } from "@statsify/schemas";
import { Historical, If, Table } from "../../../components/index.js";
import { arrayGroup, formatRaceTime, formatTime } from "@statsify/util";
import type { LocalizeFunction, ProfileTime } from "../../../types.js";

const color = cardColors(ARCADE, "dropper");

interface DropperTableProps {
  stats: Dropper;
  submode: SubModeForMode<ArcadeModes, "dropper">;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const DropperTable = ({ stats, submode, t, time }: DropperTableProps) => {
  if (submode.api === "overall") return (
    <Table.table>
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
        <Table.td title={t("stats.fails")} value={t(stats.fails)} color={color("fails")} />
        <Table.td title={t("stats.mapsCompleted")} value={t(stats.mapsCompleted)} color={color("mapsCompleted")} />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.gamesPlayed")} value={t(stats.gamesPlayed)} color={color("gamesPlayed")} />
        <Table.td title={t("stats.gamesFinished")} value={t(stats.gamesFinished)} color={color("gamesFinished")} />
      </Table.tr>
      <If condition={stats.bestTime > 0}>
        <Table.tr>
          <Historical.exclude time={time}>
            <Table.td title={t("stats.bestTime")} value={formatTime(stats.bestTime)} color={color("bestTime")} />
          </Historical.exclude>
          <Table.td title={t("stats.flawlessGames")} value={t(stats.flawlessGames)} color={color("flawlessGames")} />
        </Table.tr>
      </If>
    </Table.table>
  );

  return <DropperMapsTable dropper={stats} t={t} stat={submode.api} />;
};

const DIFFICULTIES = DROPPER_DIFFICULTIES.map(({ name, maps }) => ({ name, groups: arrayGroup(maps, 4) }));

interface DropperMapsTableProps {
  dropper: Dropper;
  t: LocalizeFunction;
  stat: Exclude<SubModeForMode<ArcadeModes, "dropper">["api"], "overall">;
}

const DropperMapsTable = ({ dropper, t, stat }: DropperMapsTableProps) => (
  <Table.table>
    {DIFFICULTIES.map(({ name, groups }) => (
      <Table.ts title={name}>
        {groups.map((group) => <DropperMapGroup dropper={dropper} group={group} stat={stat} t={t} />)}
      </Table.ts>
    ))}
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

        const field = stat === "bestTimes" ? "bestTime" : "completions";
        return <Table.td title={mapName} value={value} size="inline" color={color(`maps.${key}.${field}`)} />;
      })}
  </Table.tr>
);
