/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DUNGEON_CLASSES, type DungeonFloor, type DungeonGrade, type DungeonsSection } from "#types";
import { ESSENCE_SHOPS, LEVELING } from "#data";
import { add, ratio } from "@statsify/math";
import { fractionalLevel, getLevel } from "#leveling";
import type { RawDungeonType, RawMember } from "#raw";

const MAX_LEVEL = LEVELING.leveling_caps.catacombs;

// Each grade by the lowest Dungeon Score that earns it
const GRADES: [DungeonGrade, number][] = [["S+", 300], ["S", 269.5], ["A", 230], ["B", 160], ["C", 100], ["D", 0]];

const dungeonGrade = (score: number) => GRADES.find(([, lowest]) => score >= lowest)![0];

function floorsOf(type: RawDungeonType | undefined, first: number): DungeonFloor[] {
  return Array.from({ length: 8 - first }, (_, i) => {
    const key = String(first + i);
    const completions = type?.tier_completions?.[key] ?? 0;
    const score = type?.best_score?.[key];
    return {
      floor: first + i,
      // Master Mode often has no times_played, though every completion was a run
      played: Math.max(type?.times_played?.[key] ?? 0, completions),
      completions,
      best: score === undefined ? undefined : { score, grade: dungeonGrade(score) },
      fastest: type?.fastest_time?.[key],
      fastestS: type?.fastest_time_s?.[key],
      fastestSPlus: type?.fastest_time_s_plus?.[key],
      mobsKilled: type?.mobs_killed?.[key] ?? 0,
      mostMobsKilled: type?.most_mobs_killed?.[key],
      mostHealing: type?.most_healing?.[key],
      milestoneCompletions: type?.milestone_completions?.[key] ?? 0,
    };
  });
}

const mostDamage = (type: RawDungeonType | undefined) =>
  Object.fromEntries(
    DUNGEON_CLASSES.map((name) => [name, Math.max(0, ...Object.values(type?.[`most_damage_${name}`] ?? {}))])
  ) as DungeonsSection["mostDamage"]["normal"];

// catacombs' counts include Master Mode runs, and master_catacombs never has any. The API's own "total" is often
// below the floors' sum, so it's left out.
const watcherKills = (type: RawDungeonType | undefined) =>
  add(...Object.entries(type?.watcher_kills ?? {}).flatMap(([floor, kills]) => (floor === "total" ? [] : [kills])));

/** Catacombs and classes keep leveling past 50. Floor 0 is the Entrance. */
export function getDungeons(member: RawMember): DungeonsSection {
  const dungeons = member.dungeons;
  const types = dungeons?.dungeon_types;

  const classes = Object.fromEntries(
    DUNGEON_CLASSES.map((name) => [
      name,
      getLevel(dungeons?.player_classes?.[name]?.experience ?? 0, LEVELING.catacombs, MAX_LEVEL, true),
    ])
  ) as DungeonsSection["classes"];

  const floors = { normal: floorsOf(types?.catacombs, 0), master: floorsOf(types?.master_catacombs, 1) };
  const secrets = dungeons?.secrets ?? 0;

  return {
    catacombs: getLevel(types?.catacombs?.experience ?? 0, LEVELING.catacombs, MAX_LEVEL, true),
    classes,
    classAverage: add(...Object.values(classes).map(fractionalLevel)) / DUNGEON_CLASSES.length,
    classXp: add(...Object.values(classes).map(({ xp }) => xp)),
    selectedClass: dungeons?.selected_dungeon_class,
    secrets,
    // The floors' own completions: the raw "total" counts only some of them
    secretsPerRun: ratio(secrets, add(...[...floors.normal, ...floors.master].map(({ completions }) => completions))),
    floors,
    highestFloor: {
      normal: types?.catacombs?.highest_tier_completed,
      master: types?.master_catacombs?.highest_tier_completed,
    },
    mostDamage: { normal: mostDamage(types?.catacombs), master: mostDamage(types?.master_catacombs) },
    watcherKills: watcherKills(types?.catacombs),
    essence: Object.entries(ESSENCE_SHOPS).map(([type, shop]) => ({
      type,
      // Fossil Essence was Fossil Dust until 2026-04-21, and the API still sends it under that name, unrounded
      amount:
        type === "FOSSIL" ?
          member.glacite_player_data?.fossil_dust && Math.floor(member.glacite_player_data.fossil_dust) :
          member.currencies?.essence?.[type]?.current,
      perks: add(...Object.keys(shop).map((perk) => member.player_data?.perks?.[perk] ?? 0)),
      maxPerks: add(...Object.values(shop)),
    })),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("dungeonGrade starts each grade at its lowest score", () => {
    expect([300, 299, 269.5, 269, 230, 160, 159, 100, 99].map(dungeonGrade)).toEqual(["S+", "S", "S", "A", "A", "B", "C", "C", "D"]);
  });
}
