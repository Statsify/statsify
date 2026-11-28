/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PETS } from "#data";
import { type Level, RARITIES, type Rarity } from "#types";
import type { RawPet } from "#raw";

export const SKYBLOCK_XP_PER_LEVEL = 100;

export const PET_RARITIES = RARITIES.slice(0, 6);

interface LevelOptions {
  overflow?: boolean;
}

// table[i] is the XP that takes level i to i + 1.
export function getLevel(
  xp: number,
  table: number[],
  maxLevel: number,
  { overflow = false }: LevelOptions = {},
): Level {
  const cap = overflow ? table.length : Math.min(maxLevel, table.length);
  let level = 0;
  let xpCurrent = xp;

  while (level < cap && xpCurrent >= table[level]) {
    xpCurrent -= table[level];
    level++;
  }

  // Past the table, each level costs its last entry, as Catacombs' 200M does.
  if (overflow && level === table.length) {
    const last = table.at(-1)!;
    level += Math.floor(xpCurrent / last);
    xpCurrent %= last;
    return {
      level,
      maxLevel,
      xp,
      xpCurrent,
      xpForNext: last,
      progress: xpCurrent / last,
    };
  }

  const xpForNext = level < cap ? table[level] : undefined;
  return {
    level,
    maxLevel,
    xp,
    xpCurrent,
    xpForNext,
    progress: xpForNext === undefined ? 1 : xpCurrent / xpForNext,
  };
}

export const fractionalLevel = ({ level, progress, xpForNext }: Level) =>
  level + (xpForNext === undefined ? 0 : progress);

export const toLevelCosts = (thresholds: number[]) =>
  thresholds.map((threshold, i) => threshold - (thresholds[i - 1] ?? 0));

export function boostedRarity(pet: RawPet): Rarity {
  const rarity = pet.tier as Rarity;
  if (pet.heldItem !== "PET_ITEM_TIER_BOOST") return rarity;
  return PET_RARITIES[RARITIES.indexOf(rarity) + 1] ?? rarity;
}

// Custom tables add levels past 100, like Golden Dragon's to 200.
export function getPetLevel(pet: RawPet, rarity: Rarity): Level {
  const custom = PETS.custom_pet_leveling[pet.type] ?? {};
  const offset =
    custom.rarity_offset?.[rarity] ?? PETS.pet_rarity_offset[rarity];
  const maxLevel = custom.max_level ?? 100;
  const table = [
    ...PETS.pet_levels.slice(offset, offset + 99),
    ...(custom.pet_levels ?? []),
  ];
  const level = getLevel(pet.exp, table, maxLevel - 1);
  return { ...level, level: level.level + 1, maxLevel };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getLevel", () => {
    it("should walk per-level costs", () => {
      expect(getLevel(0, [50, 125, 200], 3)).toMatchObject({
        level: 0,
        xpCurrent: 0,
        xpForNext: 50,
        progress: 0,
      });
      expect(getLevel(175, [50, 125, 200], 3)).toMatchObject({
        level: 2,
        xpCurrent: 0,
        xpForNext: 200,
      });
      expect(getLevel(274, [50, 125, 200], 3)).toMatchObject({
        level: 2,
        xpCurrent: 99,
        progress: 0.495,
      });
    });

    it("should stop at the max level", () => {
      expect(getLevel(10_000, [50, 125, 200], 3)).toMatchObject({
        level: 3,
        xpCurrent: 9625,
        xpForNext: undefined,
        progress: 1,
      });
      expect(getLevel(10_000, [50, 125, 200], 2)).toMatchObject({
        level: 2,
        maxLevel: 2,
      });
    });

    it("should keep going at the last cost with overflow", () => {
      expect(
        getLevel(10_000, [50, 125, 200], 2, { overflow: true }),
      ).toMatchObject({
        level: 51,
        maxLevel: 2,
        xpCurrent: 25,
        xpForNext: 200,
      });
    });
  });

  suite("toLevelCosts", () => {
    it("should turn thresholds into per-level costs", () => {
      expect(toLevelCosts([5, 15, 200])).toEqual([5, 10, 185]);
    });
  });

  suite("fractionalLevel", () => {
    it("should add the progress below the max level", () => {
      expect(fractionalLevel(getLevel(274, [50, 125, 200], 3))).toBe(2.495);
      expect(fractionalLevel(getLevel(10_000, [50, 125, 200], 3))).toBe(3);
    });
  });

  suite("getPetLevel", () => {
    it("should level from the rarity's offset", () => {
      const bee = { type: "BEE", tier: "EPIC", exp: 20_000_000, active: false };
      expect(getPetLevel(bee, "EPIC").level).toBe(100);
      expect(getPetLevel(bee, "LEGENDARY")).toMatchObject({
        level: 96,
        maxLevel: 100,
      });
    });

    it("should use a custom table past 100", () => {
      const dragon = {
        type: "GOLDEN_DRAGON",
        tier: "LEGENDARY",
        exp: 25_353_230,
        active: false,
      };
      expect(getPetLevel(dragon, "LEGENDARY")).toMatchObject({
        level: 100,
        maxLevel: 200,
      });
    });
  });
}
