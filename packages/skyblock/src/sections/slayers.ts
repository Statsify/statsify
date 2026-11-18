/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LEVELING } from "#data";
import { SLAYER_BOSSES, type SlayersSection } from "#types";
import { add } from "@statsify/math";
import { getLevel, toLevelCosts } from "#leveling";
import type { RawMember, RawSlayerBoss } from "#raw";

/** Levels reached whose reward wasn't claimed. Past a boss's usual levels the key gains _special (level_7_special). */
const unclaimedLevels = (level: number, claimed: RawSlayerBoss["claimed_levels"] = {}) =>
  Array.from({ length: level }, (_, i) => i + 1).filter((n) => !claimed[`level_${n}`] && !claimed[`level_${n}_special`]).length;

export function getSlayers(member: RawMember): SlayersSection {
  const bosses = SLAYER_BOSSES.map((boss) => {
    const thresholds = LEVELING.slayer_xp[boss];
    const raw = member.slayer?.slayer_bosses?.[boss];
    const xp = raw?.xp ?? 0;
    const tiers = Array.from({ length: LEVELING.slayer_to_highest_tier[boss] }, (_, i) => i);
    const level = getLevel(xp, toLevelCosts(thresholds), thresholds.length);
    return [
      boss,
      {
        level,
        kills: tiers.map((tier) => raw?.[`boss_kills_tier_${tier}`] ?? 0),
        attempts: tiers.map((tier) => raw?.[`boss_attempts_tier_${tier}`] ?? 0),
        unclaimedLevels: unclaimedLevels(level.level, raw?.claimed_levels),
      },
    ] as const;
  });

  return {
    xp: add(...bosses.map(([, { level }]) => level.xp)),
    bosses: Object.fromEntries(bosses) as SlayersSection["bosses"],
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("unclaimedLevels counts the levels reached without a claim, special ones included", () => {
    expect(unclaimedLevels(0)).toBe(0);
    expect(unclaimedLevels(3, { level_1: true, level_3: true })).toBe(1);
    expect(unclaimedLevels(8, { level_1: true, level_2: true, level_3: true, level_4: true, level_5: true, level_6: true, level_7_special: true })).toBe(1);
  });
}
