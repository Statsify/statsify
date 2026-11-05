/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { Constructor } from "@statsify/util";
import { getLeaderboardField } from "./leaderboard-scanner.js";

const SUFFIXES: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9 };

function getLowestScore(searchBy: (score: number) => number, value: number) {
  let low = 0;
  let high = Number.MAX_SAFE_INTEGER;

  if (searchBy(high) < value) return Number.NaN;

  while (low < high) {
    const mid = low + Math.floor((high - low) / 2);

    if (searchBy(mid) < value) low = mid + 1;
    else high = mid;
  }

  return low;
}

/**
 * @returns The score a search like `10k`, `500✫` or `1:23.45` sorts at, or NaN if it can't be read
 */
export function parseLeaderboardValue(
  constructor: Constructor,
  key: string,
  input: string,
) {
  const { parser, searchBy } = getLeaderboardField(constructor, key);
  const search = input.replaceAll(",", "").trim().toLowerCase();

  if (parser) return parser(search);

  const match = /^(\d*\.?\d+)\s*([kmb])?/.exec(search);
  if (!match) return Number.NaN;

  const [, number, suffix] = match;
  const value = Number(number) * (suffix ? SUFFIXES[suffix] : 1);

  return searchBy ? getLowestScore(searchBy, value) : value;
}
