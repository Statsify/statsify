/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LEVELING } from "#data";
import { add } from "@statsify/math";
import { fractionalLevel, getLevel } from "#leveling";
import type { DungeonFloor, DungeonsSection } from "#types";
import type { RawDungeonType, RawMember } from "#raw";

export const DUNGEON_CLASSES = ["healer", "mage", "berserk", "archer", "tank"] as const;

const MAX_LEVEL = LEVELING.leveling_caps.catacombs;

function floorsOf(type: RawDungeonType | undefined, first: number): DungeonFloor[] {
  return Array.from({ length: 8 - first }, (_, i) => {
    const key = String(first + i);
    return {
      floor: first + i,
      completions: type?.tier_completions?.[key] ?? 0,
      bestScore: type?.best_score?.[key],
      fastest: type?.fastest_time?.[key],
      fastestS: type?.fastest_time_s?.[key],
      fastestSPlus: type?.fastest_time_s_plus?.[key],
    };
  });
}

/** Catacombs keeps levelling past 50 (200M XP a level, from NEU's table); classes stop at 50. Floor 0 is the Entrance. */
export function getDungeons(member: RawMember): DungeonsSection {
  const dungeons = member.dungeons;
  const types = dungeons?.dungeon_types;

  const classes = Object.fromEntries(
    DUNGEON_CLASSES.map((name) => [
      name,
      getLevel(dungeons?.player_classes?.[name]?.experience ?? 0, LEVELING.catacombs, MAX_LEVEL),
    ])
  );

  return {
    catacombs: getLevel(types?.catacombs?.experience ?? 0, LEVELING.catacombs, MAX_LEVEL, true),
    classes,
    classAverage: add(...Object.values(classes).map(fractionalLevel)) / DUNGEON_CLASSES.length,
    selectedClass: dungeons?.selected_dungeon_class,
    secrets: dungeons?.secrets ?? 0,
    floors: { normal: floorsOf(types?.catacombs, 0), master: floorsOf(types?.master_catacombs, 1) },
  };
}
