/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LEVELING } from "#data";
import { add } from "@statsify/math";
import { getLevel, toLevelCosts } from "#leveling";
import type { RawMember, RawSlayerBoss } from "#raw";
import type { SlayersSection } from "#types";

export const SLAYER_BOSSES = [
  "zombie",
  "spider",
  "wolf",
  "enderman",
  "blaze",
  "vampire",
] as const;

export type SlayerBoss = (typeof SLAYER_BOSSES)[number];

// A level past a boss's usual ones is claimed as level_<n>_special.
function countUnclaimedLevels(
  level: number,
  claimed: RawSlayerBoss["claimed_levels"] = {},
) {
  let unclaimed = 0;
  for (let n = 1; n <= level; n++) {
    if (!claimed[`level_${n}`] && !claimed[`level_${n}_special`]) unclaimed++;
  }
  return unclaimed;
}

export function getSlayers(member: RawMember): SlayersSection {
  const bosses = SLAYER_BOSSES.map((boss) => {
    const thresholds = LEVELING.slayer_xp[boss];
    const raw = member.slayer?.slayer_bosses?.[boss];
    const xp = raw?.xp ?? 0;
    const tiers = Array.from(
      { length: LEVELING.slayer_to_highest_tier[boss] },
      (_, i) => i,
    );
    const level = getLevel(xp, toLevelCosts(thresholds), thresholds.length);
    return [
      boss,
      {
        level,
        kills: tiers.map((tier) => raw?.[`boss_kills_tier_${tier}`] ?? 0),
        attempts: tiers.map((tier) => raw?.[`boss_attempts_tier_${tier}`] ?? 0),
        unclaimedLevels: countUnclaimedLevels(level.level, raw?.claimed_levels),
      },
    ] as const;
  });

  return {
    xp: add(...bosses.map(([, { level }]) => level.xp)),
    bosses: Object.fromEntries(bosses) as SlayersSection["bosses"],
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("countUnclaimedLevels", () => {
    it("should count the levels reached without a claim", () => {
      expect(countUnclaimedLevels(0)).toBe(0);
      expect(countUnclaimedLevels(3, { level_1: true, level_3: true })).toBe(1);
    });

    it("should take a special claim past the usual levels", () => {
      const claimed = {
        level_1: true,
        level_2: true,
        level_3: true,
        level_4: true,
        level_5: true,
        level_6: true,
        level_7_special: true,
      };
      expect(countUnclaimedLevels(8, claimed)).toBe(1);
    });
  });
}
