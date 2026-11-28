/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BESTIARY } from "#data";
import { add } from "@statsify/math";
import { countTiersReached } from "#leveling";
import type { BestiarySection } from "#types";
import type { RawMember } from "#raw";

export function getBestiaryTier(kills: number, cap: number, bracket: number[]) {
  const thresholds = bracket.filter((needed) => needed <= cap);
  const tier = countTiersReached(kills, thresholds);
  return { tier, maxTier: thresholds.length, next: thresholds[tier] };
}

export function getBestiary(member: RawMember): BestiarySection {
  const kills = member.bestiary?.kills ?? {};

  const pages = BESTIARY.pages.map(({ category, name, families }) => ({
    category,
    name,
    families: families.map((family) => {
      const total = add(...family.ids.map((id) => Number(kills[id] ?? 0)));
      const bracket = BESTIARY.brackets[family.bracket];
      return {
        name: family.name,
        kills: total,
        ...getBestiaryTier(total, family.cap, bracket),
      };
    }),
  }));

  const families = pages.flatMap(({ families }) => families);
  const tiers = add(...families.map(({ tier }) => tier));

  // Some members claimed a higher milestone in game than their tiers give.
  const claimed = member.bestiary?.milestone?.last_claimed_milestone ?? 0;

  return {
    milestone: Math.max(Math.floor(tiers / 10), claimed),
    tiers,
    maxTiers: add(...families.map(({ maxTier }) => maxTier)),
    maxed: families.filter(({ tier, maxTier }) => tier === maxTier).length,
    total: families.length,
    pages,
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getBestiaryTier", () => {
    it("should count the bracket's tiers reached, up to the family's cap", () => {
      const bracket = [10, 20, 50, 100, 250];
      expect(getBestiaryTier(0, 100, bracket)).toEqual({
        tier: 0,
        maxTier: 4,
        next: 10,
      });
      expect(getBestiaryTier(20, 100, bracket)).toEqual({
        tier: 2,
        maxTier: 4,
        next: 50,
      });
      expect(getBestiaryTier(5000, 100, bracket)).toEqual({
        tier: 4,
        maxTier: 4,
        next: undefined,
      });
    });
  });
}
