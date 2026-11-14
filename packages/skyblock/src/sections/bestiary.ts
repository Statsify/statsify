/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BESTIARY } from "#data";
import { add } from "@statsify/math";
import type { BestiarySection } from "#types";
import type { RawMember } from "#raw";

/** A family's tier at its kills: each of its bracket's kills reached, up to its cap, past which kills don't count. */
export function bestiaryTier(kills: number, cap: number, bracket: number[]) {
  const steps = bracket.filter((needed) => needed <= cap);
  const tier = steps.filter((needed) => kills >= needed).length;
  return { tier, maxTier: steps.length, next: steps[tier] };
}

/** Each family's kills and tier by page, as NEU's bestiary lists them, from the member's bestiary kills. */
export function getBestiary(member: RawMember): BestiarySection {
  const kills = member.bestiary?.kills ?? {};

  const pages = BESTIARY.pages.map(({ category, name, families }) => ({
    category,
    name,
    families: families.map((family) => {
      const total = add(...family.ids.map((id) => kills[id] ?? 0));
      return { name: family.name, kills: total, ...bestiaryTier(total, family.cap, BESTIARY.brackets[family.bracket]) };
    }),
  }));

  const families = pages.flatMap(({ families }) => families);
  const tiers = add(...families.map(({ tier }) => tier));

  // A few members count fewer tiers than the milestone they claimed in game, so it's at least the claimed one
  return {
    milestone: Math.max(Math.floor(tiers / 10), member.bestiary?.milestone?.last_claimed_milestone ?? 0),
    tiers,
    maxTiers: add(...families.map(({ maxTier }) => maxTier)),
    maxed: families.filter(({ tier, maxTier }) => tier === maxTier).length,
    total: families.length,
    pages,
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("bestiaryTier counts the bracket's steps reached, up to the family's cap", () => {
    const bracket = [10, 20, 50, 100, 250];
    expect(bestiaryTier(0, 100, bracket)).toEqual({ tier: 0, maxTier: 4, next: 10 });
    expect(bestiaryTier(20, 100, bracket)).toEqual({ tier: 2, maxTier: 4, next: 50 });
    expect(bestiaryTier(5000, 100, bracket)).toEqual({ tier: 4, maxTier: 4, next: undefined });
  });
}
