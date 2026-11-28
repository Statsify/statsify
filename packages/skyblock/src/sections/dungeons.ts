/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ESSENCE_SHOPS, LEVELING } from "#data";
import { add } from "@statsify/math";
import { fractionalLevel, getLevel } from "#leveling";
import type {
  DungeonFloor,
  DungeonGrade,
  DungeonsSection,
  Essence,
} from "#types";
import type { RawDungeonType, RawMember } from "#raw";

export const DUNGEON_CLASSES = [
  "healer",
  "mage",
  "berserk",
  "archer",
  "tank",
] as const;

export type DungeonClass = (typeof DUNGEON_CLASSES)[number];

const MAX_LEVEL = LEVELING.leveling_caps.catacombs;

// Hypixel sends no balance for these shops' essence.
const UNSENT_ESSENCE = new Set(["FOREST", "FOSSIL", "SUN_GECKO"]);

const GRADES: [DungeonGrade, number][] = [
  ["S+", 300],
  ["S", 269.5],
  ["A", 230],
  ["B", 160],
  ["C", 100],
  ["D", 0],
];

function getGrade(score: number) {
  return GRADES.find(([, lowest]) => score >= lowest)![0];
}

function getFloors(
  type: RawDungeonType | undefined,
  first: number,
): DungeonFloor[] {
  return Array.from({ length: 8 - first }, (_, i) => {
    const key = String(first + i);
    const completions = type?.tier_completions?.[key] ?? 0;
    const score = type?.best_score?.[key];
    return {
      floor: first + i,
      // Master Mode often has no times_played, though each clear was a run.
      played: Math.max(type?.times_played?.[key] ?? 0, completions),
      completions,
      best: score === undefined ? undefined : { score, grade: getGrade(score) },
      fastest: type?.fastest_time?.[key],
      fastestS: type?.fastest_time_s?.[key],
      fastestSPlus: type?.fastest_time_s_plus?.[key],
    };
  });
}

function getMostDamage(type: RawDungeonType | undefined) {
  return Object.fromEntries(
    DUNGEON_CLASSES.map((name) => [
      name,
      Math.max(0, ...Object.values(type?.[`most_damage_${name}`] ?? {})),
    ]),
  ) as Record<DungeonClass, number>;
}

function getWatcherKills(type: RawDungeonType | undefined) {
  // Hypixel's "total" often falls short of the floors' sum.
  const floors = Object.entries(type?.watcher_kills ?? {}).filter(
    ([floor]) => floor !== "total",
  );
  return add(...floors.map(([, kills]) => kills));
}

function getEssence(member: RawMember): Essence[] {
  const perks = member.player_data?.perks;

  return Object.entries(ESSENCE_SHOPS).map(([type, shop]) => ({
    type,
    amount: UNSENT_ESSENCE.has(type)
      ? undefined
      : (member.currencies?.essence?.[type]?.current ?? 0),
    perks: add(...Object.keys(shop).map((perk) => Number(perks?.[perk] ?? 0))),
    maxPerks: add(...Object.values(shop)),
  }));
}

export function getDungeons(member: RawMember): DungeonsSection {
  const dungeons = member.dungeons;
  const types = dungeons?.dungeon_types;

  const classes = Object.fromEntries(
    DUNGEON_CLASSES.map((name) => [
      name,
      getLevel(
        dungeons?.player_classes?.[name]?.experience ?? 0,
        LEVELING.catacombs,
        MAX_LEVEL,
        { overflow: true },
      ),
    ]),
  ) as DungeonsSection["classes"];

  return {
    catacombs: getLevel(
      types?.catacombs?.experience ?? 0,
      LEVELING.catacombs,
      MAX_LEVEL,
      { overflow: true },
    ),
    classes,
    classAverage:
      add(...Object.values(classes).map(fractionalLevel)) /
      DUNGEON_CLASSES.length,
    selectedClass: dungeons?.selected_dungeon_class,
    secrets: dungeons?.secrets ?? 0,
    floors: {
      // Floor 0 is the Entrance.
      normal: getFloors(types?.catacombs, 0),
      master: getFloors(types?.master_catacombs, 1),
    },
    highestFloor: {
      normal: types?.catacombs?.highest_tier_completed,
      master: types?.master_catacombs?.highest_tier_completed,
    },
    mostDamage: {
      normal: getMostDamage(types?.catacombs),
      master: getMostDamage(types?.master_catacombs),
    },
    // Catacombs counts Master Mode's kills too.
    watcherKills: getWatcherKills(types?.catacombs),
    essence: getEssence(member),
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getGrade", () => {
    it("should start each grade at its lowest score", () => {
      expect(getGrade(300)).toBe("S+");
      expect(getGrade(299)).toBe("S");
      expect(getGrade(269.5)).toBe("S");
      expect(getGrade(269)).toBe("A");
      expect(getGrade(230)).toBe("A");
      expect(getGrade(160)).toBe("B");
      expect(getGrade(159)).toBe("C");
      expect(getGrade(100)).toBe("C");
      expect(getGrade(99)).toBe("D");
    });
  });
}
