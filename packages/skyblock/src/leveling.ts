/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Level } from "#types";

/**
 * table[i] takes level i to i + 1. With `overflow`, levels keep going past `maxLevel`: through the rest of the table,
 * then at its last cost, as Catacombs' 200M a level does.
 */
export function getLevel(xp: number, table: readonly number[], maxLevel: number, overflow = false): Level {
  const cap = overflow ? table.length : Math.min(maxLevel, table.length);
  let level = 0;
  let xpCurrent = xp;

  while (level < cap && xpCurrent >= table[level]) {
    xpCurrent -= table[level];
    level++;
  }

  if (overflow && level === table.length) {
    const last = table.at(-1)!;
    level += Math.floor(xpCurrent / last);
    xpCurrent %= last;
    return { level, maxLevel, xp, xpCurrent, xpForNext: last, progress: xpCurrent / last };
  }

  const xpForNext = level < cap ? table[level] : undefined;
  return { level, maxLevel, xp, xpCurrent, xpForNext, progress: xpForNext === undefined ? 1 : xpCurrent / xpForNext };
}

/** The level plus its progress toward the next, as averages take it; a capped level adds nothing. */
export const fractionalLevel = ({ level, progress, xpForNext }: Level) => level + (xpForNext === undefined ? 0 : progress);

/** Cumulative thresholds (slayer_xp's layout) as per-level costs. */
export const toLevelCosts = (thresholds: readonly number[]) =>
  thresholds.map((threshold, i) => threshold - (thresholds[i - 1] ?? 0));

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getLevel walks per-level costs", () => {
    const table = [50, 125, 200];
    expect(getLevel(0, table, 3)).toMatchObject({ level: 0, xpCurrent: 0, xpForNext: 50, progress: 0 });
    expect(getLevel(175, table, 3)).toMatchObject({ level: 2, xpCurrent: 0, xpForNext: 200 });
    expect(getLevel(274, table, 3)).toMatchObject({ level: 2, xpCurrent: 99, progress: 0.495 });
    expect(getLevel(10_000, table, 3)).toMatchObject({ level: 3, xpCurrent: 9625, xpForNext: undefined, progress: 1 });
    expect(getLevel(10_000, table, 2)).toMatchObject({ level: 2, maxLevel: 2 });
    expect(getLevel(10_000, table, 2, true)).toMatchObject({ level: 51, maxLevel: 2, xpCurrent: 25, xpForNext: 200 });
    expect(toLevelCosts([5, 15, 200])).toEqual([5, 10, 185]);
    expect(fractionalLevel(getLevel(274, table, 3))).toBe(2.495);
    expect(fractionalLevel(getLevel(10_000, table, 3))).toBe(3);
  });
}
