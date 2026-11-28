/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ChocolateSection, RARITIES } from "#types";
import { RABBITS } from "#data";
import type { RawMember } from "#raw";

// In the factory's order
const EMPLOYEES = [
  "rabbit_bro",
  "rabbit_cousin",
  "rabbit_sis",
  "rabbit_father",
  "rabbit_grandma",
  "rabbit_uncle",
  "rabbit_dog",
] as const;

// The wiki's Chocolate Factory page gives what prestiges II to VI need.
const PRESTIGE_CHOCOLATE = [
  150_000_000, 1_000_000_000, 4_000_000_000, 10_000_000_000, 30_000_000_000,
];

export function getChocolate(member: RawMember): ChocolateSection | null {
  const easter = member.events?.easter;
  const found = new Set(
    Object.entries(easter?.rabbits ?? {})
      .filter(([, count]) => typeof count === "number")
      .map(([rabbit]) => rabbit),
  );

  // Hypixel sends the record with only its egg objects before any chocolate.
  if (!easter || (!easter.total_chocolate && found.size === 0)) return null;

  // Hypixel leaves chocolate_level out until the first prestige.
  const level = easter.chocolate_level ?? 1;

  const rabbits: ChocolateSection["rabbits"] = [];
  for (const rarity of RARITIES) {
    const names = RABBITS[rarity.toLowerCase()];
    if (!names) continue;

    const owned = names.filter((rabbit) => found.has(rabbit));
    rabbits.push({ rarity, found: owned.length, total: names.length });
  }

  return {
    level,
    chocolate: easter.chocolate ?? 0,
    total: easter.total_chocolate ?? 0,
    sincePrestige: easter.chocolate_since_prestige ?? 0,
    nextPrestige: PRESTIGE_CHOCOLATE[level - 1],
    rabbits,
    employees: EMPLOYEES.map((employee) => ({
      employee,
      level: easter.employees?.[employee] ?? 0,
    })),
    timeTower: easter.time_tower?.level ?? 0,
  };
}
