/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { RABBITS } from "#data";
import { RARITIES, type ChocolateSection } from "#types";
import { add } from "@statsify/math";
import type { RawMember } from "#raw";

// In the factory's order
const EMPLOYEES = ["rabbit_bro", "rabbit_cousin", "rabbit_sis", "rabbit_father", "rabbit_grandma", "rabbit_uncle", "rabbit_dog"] as const;
// The chocolate since the last prestige that each next one needs, II to VI (the wiki's Chocolate Factory page, an
// owner exception, unverified)
const PRESTIGE_CHOCOLATE = [150_000_000, 1_000_000_000, 4_000_000_000, 10_000_000_000, 30_000_000_000];

// The rabbits record also holds faction_level
const ALL_RABBITS = new Set(Object.values(RABBITS).flat());

/** null before the member opens the Chocolate Factory. A rabbit counts once however often it was found. */
export function getChocolate(member: RawMember): ChocolateSection | null {
  const easter = member.events?.easter;
  const counts = Object.entries(easter?.rabbits ?? {}).flatMap(([rabbit, count]) =>
    typeof count === "number" && ALL_RABBITS.has(rabbit) ? [[rabbit, count] as const] : []
  );
  const found = new Set(counts.map(([rabbit]) => rabbit));

  // Hypixel sends the record, holding only the egg objects, before the factory makes any chocolate
  if (!easter || (!easter.total_chocolate && found.size === 0)) return null;

  // Hypixel leaves chocolate_level out until the first prestige
  const level = easter.chocolate_level ?? 1;

  return {
    level,
    chocolate: easter.chocolate ?? 0,
    total: easter.total_chocolate ?? 0,
    sincePrestige: easter.chocolate_since_prestige ?? 0,
    nextPrestige: PRESTIGE_CHOCOLATE[level - 1],
    rabbits: RARITIES.flatMap((rarity) => {
      const rabbits = RABBITS[rarity.toLowerCase()];
      return rabbits ? [{ rarity, found: rabbits.filter((rabbit) => found.has(rabbit)).length, total: rabbits.length }] : [];
    }),
    employees: EMPLOYEES.map((employee) => ({ employee, level: easter.employees?.[employee] ?? 0 })),
    timeTower: easter.time_tower?.level ?? 0,
    duplicates: add(...counts.map(([, count]) => Math.max(0, count - 1))),
    eggLocations: add(...Object.values(easter.rabbits?.collected_locations ?? {}).map((spots) => spots.length)),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getChocolate puts a factory that never prestiged at prestige 1", () => {
    expect(getChocolate({ events: { easter: { total_chocolate: 5, chocolate_since_prestige: 5 } } })?.level).toBe(1);
  });
}
