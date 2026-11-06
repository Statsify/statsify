/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { RABBITS } from "#data";
import { RARITIES, type ChocolateSection } from "#types";
import type { RawMember } from "#raw";

// In the factory's order
const EMPLOYEES = ["rabbit_bro", "rabbit_cousin", "rabbit_sis", "rabbit_father", "rabbit_grandma", "rabbit_uncle", "rabbit_dog"] as const;

/** null before the member opens the Chocolate Factory. A rabbit counts once however often it was found. */
export function getChocolate(member: RawMember): ChocolateSection | null {
  const easter = member.events?.easter;
  const found = new Set(Object.entries(easter?.rabbits ?? {}).flatMap(([rabbit, count]) => (typeof count === "number" ? [rabbit] : [])));

  // Hypixel sends the record, holding only the egg objects, before the factory makes any chocolate
  if (!easter || (!easter.total_chocolate && found.size === 0)) return null;

  return {
    // Hypixel leaves chocolate_level out until the first prestige
    level: easter.chocolate_level ?? 1,
    chocolate: easter.chocolate ?? 0,
    total: easter.total_chocolate ?? 0,
    sincePrestige: easter.chocolate_since_prestige ?? 0,
    rabbits: RARITIES.flatMap((rarity) => {
      const rabbits = RABBITS[rarity.toLowerCase()];
      return rabbits ? [{ rarity, found: rabbits.filter((rabbit) => found.has(rabbit)).length, total: rabbits.length }] : [];
    }),
    employees: EMPLOYEES.map((employee) => ({ employee, level: easter.employees?.[employee] ?? 0 })),
    timeTower: easter.time_tower?.level ?? 0,
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getChocolate puts a factory that never prestiged at prestige 1", () => {
    expect(getChocolate({ events: { easter: { total_chocolate: 5, chocolate_since_prestige: 5 } } })?.level).toBe(1);
  });
}
