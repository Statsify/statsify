/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Constructor, formatRaceTime, formatTime } from "@statsify/util";
import { getLeaderboardField } from "./leaderboard-scanner.js";

const SUFFIXES: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9 };

// formatTime's units in milliseconds, so a time can be searched the way the leaderboard shows it
const TIME_UNITS: Record<string, number> = {
  y: 31_104_000_000,
  mo: 2_592_000_000,
  d: 86_400_000,
  h: 3_600_000,
  m: 60_000,
  s: 1000,
  ms: 1,
};

// Binary search for the lowest score that reaches the value, which needs searchBy to never go down
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
 * Turns a value searched on a leaderboard, like `10k`, `500✫` or `1:23.45`, into the score the leaderboard is sorted by
 * @returns NaN if the value can't be read
 */
export function parseLeaderboardValue(
  constructor: Constructor,
  key: string,
  input: string,
) {
  const { formatter, searchBy } = getLeaderboardField(constructor, key);
  const search = input.replaceAll(",", "").trim().toLowerCase();

  // Times are searched in seconds, like 1:23.45 or 83.45, or in units, like 5d 3h, but stored in milliseconds
  if (formatter === formatTime || formatter === formatRaceTime) {
    const units = [...search.matchAll(/(\d*\.?\d+)\s*(mo|ms|[ydhms])/g)];

    if (units.length > 0) {
      const time = units.reduce(
        (total, [, number, unit]) => total + Number(number) * TIME_UNITS[unit],
        0
      );

      return Math.round(time);
    }

    const seconds = search
      .split(":")
      .reduce((total, part) => total * 60 + Number(part), 0);

    return Math.round(seconds * 1000);
  }

  const match = /^(\d*\.?\d+)([kmb])?/.exec(search);
  if (!match) return Number.NaN;

  const [, number, suffix] = match;
  const value = Number(number) * (suffix ? SUFFIXES[suffix] : 1);

  return searchBy ? getLowestScore(searchBy, value) : value;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  const { Player } = await import("#player");

  it("parses numbers, times and levels", () => {
    expect(parseLeaderboardValue(Player, "stats.bedwars.overall.wins", "1.5k")).toBe(1500);
    expect(parseLeaderboardValue(Player, "stats.bedwars.overall.wins", "wins")).toBeNaN();
    expect(parseLeaderboardValue(Player, "stats.parkour.BEDWARS", "1:23.45")).toBe(83_450);
    expect(parseLeaderboardValue(Player, "stats.pit.playtime", "5d, 3h")).toBe(442_800_000);
    expect(parseLeaderboardValue(Player, "stats.bedwars.exp", "500✫")).toBe(2_435_000);
    expect(parseLeaderboardValue(Player, "stats.skywars.exp", "20000")).toBeNaN();
  });
}
