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

function normalizeNumber(input: string) {
  const number = input.replaceAll(/[\s'’]/g, "");
  const lastSeparatorIndex = Math.max(
    number.lastIndexOf("."),
    number.lastIndexOf(","),
  );
  if (lastSeparatorIndex === -1) return number;

  const separator = number[lastSeparatorIndex];
  const isOnlySeparatorKind = !number.includes(separator === "." ? "," : ".");
  const isRepeated = number.indexOf(separator) !== lastSeparatorIndex;

  // A lone separator before exactly three digits groups thousands, since no leaderboard shows three decimals
  const isThousands = /^\d{3}(?!\d)/.test(number.slice(lastSeparatorIndex + 1));

  if (isOnlySeparatorKind && (isRepeated || isThousands))
    return number.replaceAll(separator, "");

  const integer = number.slice(0, lastSeparatorIndex).replaceAll(/[.,]/g, "");
  return `${integer}.${number.slice(lastSeparatorIndex + 1)}`;
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
  const search = input.trim().toLowerCase();

  if (parser) {
    // In a time, a comma between digits is a decimal comma, like 1:23,45
    const time = search.replaceAll(/(?<=\d),(?=\d)/g, ".").replaceAll(",", "");
    return parser(time);
  }

  const match = /^(\d*\.?\d+)([kmb])?/.exec(normalizeNumber(search));
  if (!match) return Number.NaN;

  const [, number, suffix] = match;
  const value = Number(number) * (suffix ? SUFFIXES[suffix] : 1);

  return searchBy ? getLowestScore(searchBy, value) : value;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  const { Player } = await import("#player");

  it("parses numbers, times and levels", () => {
    expect(
      parseLeaderboardValue(Player, "stats.bedwars.overall.wins", "1.5k"),
    ).toBe(1500);
    expect(
      parseLeaderboardValue(Player, "stats.bedwars.overall.wins", "10 k"),
    ).toBe(10_000);
    expect(
      parseLeaderboardValue(Player, "stats.bedwars.overall.wins", "wins"),
    ).toBeNaN();
    expect(
      parseLeaderboardValue(Player, "stats.parkour.BEDWARS", "1:23.45"),
    ).toBe(83_450);
    expect(parseLeaderboardValue(Player, "stats.pit.playtime", "5d, 3h")).toBe(
      442_800_000,
    );
    expect(parseLeaderboardValue(Player, "stats.bedwars.exp", "500✫")).toBe(
      2_435_000,
    );
    expect(
      parseLeaderboardValue(Player, "stats.skywars.exp", "20000"),
    ).toBeNaN();
  });

  it("reads numbers the way every locale prints them", () => {
    const wins = "stats.bedwars.overall.wins";
    const fkdr = "stats.bedwars.overall.fkdr";

    expect(parseLeaderboardValue(Player, wins, "10,000")).toBe(10_000);
    expect(parseLeaderboardValue(Player, wins, "10.000")).toBe(10_000);
    expect(parseLeaderboardValue(Player, wins, "10 000")).toBe(10_000);
    expect(parseLeaderboardValue(Player, wins, "1.234.567")).toBe(1_234_567);
    expect(parseLeaderboardValue(Player, wins, "1,50M")).toBe(1_500_000);
    expect(parseLeaderboardValue(Player, fkdr, "2,50")).toBe(2.5);
    expect(parseLeaderboardValue(Player, fkdr, "1.234,5")).toBe(1234.5);
    expect(parseLeaderboardValue(Player, fkdr, "1,234.5")).toBe(1234.5);

    const parkour = "stats.parkour.BEDWARS";

    expect(parseLeaderboardValue(Player, parkour, "1:23,45")).toBe(83_450);
    expect(parseLeaderboardValue(Player, parkour, "83,450s")).toBe(83_450);
  });
}
