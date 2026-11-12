/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Hypixel's network-level coin multiplier: `[first level, multiplier]`, ascending.
 *
 * Source: the Hypixel wiki's "Coin Multipliers" table (Level → Coin Multiplier) as captured on
 * 2026-10-19. It ends at level 250 and lists levels only, so this is the level multiplier; whether
 * a rank raises it is not covered.
 */
export const LEVEL_MULTIPLIERS: ReadonlyArray<readonly [level: number, multiplier: number]> = [
  [0, 1],
  [5, 1.5],
  [10, 2],
  [15, 2.5],
  [20, 3],
  [25, 3.5],
  [30, 4],
  [40, 4.5],
  [50, 5],
  [100, 5.5],
  [125, 6],
  [150, 6.5],
  [200, 7],
  [250, 8],
];

export function levelMultiplier(level: number): number {
  let multiplier = 1;

  for (const [first, value] of LEVEL_MULTIPLIERS) {
    if (level < first) break;
    multiplier = value;
  }

  return multiplier;
}
