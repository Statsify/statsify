/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { formatRaceTime, formatTime } from "@statsify/util";

export interface Format {
  format(value: number, locale: string): string;
  /** The value a leaderboard search like `1:23` or `500✫` ranks at, or NaN if it can't be read */
  parse(input: string, locale: string): number;
}

const SUFFIXES: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9 };

const separators = new Map<string, { group: string; decimal: string }>();

function getSeparators(locale: string) {
  let found = separators.get(locale);

  if (!found) {
    const parts = new Intl.NumberFormat(locale).formatToParts(1000.5);
    found = {
      group: parts.find((part) => part.type === "group")?.value ?? ",",
      decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
    };
    separators.set(locale, found);
  }

  return found;
}

export function parseNumber(input: string, locale: string) {
  const { group, decimal } = getSeparators(locale);
  const search = input.trim().toLowerCase().replaceAll(group, "").replace(decimal, ".");

  const match = /^(\d*\.?\d+)\s*([kmb])?/.exec(search);
  if (!match) return Number.NaN;

  const [, number, suffix] = match;
  return Number(number) * (suffix ? SUFFIXES[suffix] : 1);
}

const MS_PER_UNIT: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

// Reads formatTime or formatRaceTime output, or a time like 1:23.45, back into milliseconds
function parseTime(input: string) {
  const units = [...input.matchAll(/(\d*\.?\d+)\s*(ms|[dhms])/g)];

  const time =
    units.length > 0 ?
      units.reduce((total, [, number, unit]) => total + Number(number) * MS_PER_UNIT[unit], 0) :
      input.split(":").reduce((total, part) => total * 60 + Number(part), 0) * 1000;

  return Math.round(time);
}

function lowestScore(toSearched: (score: number) => number, searched: number) {
  let low = 0;
  let high = Number.MAX_SAFE_INTEGER;

  if (toSearched(high) < searched) return Number.NaN;

  while (low < high) {
    const mid = low + Math.floor((high - low) / 2);

    if (toSearched(mid) < searched) low = mid + 1;
    else high = mid;
  }

  return low;
}

const time: Format = { format: (value) => formatTime(value), parse: parseTime };
const raceTime: Format = { format: (value) => formatRaceTime(value), parse: parseTime };

/** A stat ranked by one value and searched by another that never goes down as it goes up, like exp and level */
const searchedAs = (toSearched: (score: number) => number, format: Format["format"]): Format => ({
  format,
  parse: (input, locale) => lowestScore(toSearched, parseNumber(input, locale)),
});

export const formats = { time, raceTime, searchedAs };

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("parses searches back into the values they format", () => {
    expect(parseNumber("10k", "en-US")).toBe(10_000);
    expect(parseNumber("1,234.5", "en-US")).toBe(1234.5);
    expect(parseNumber("1.234,5", "de")).toBe(1234.5);
    expect(parseNumber("wins", "en-US")).toBeNaN();

    expect(formats.time.parse("1:23", "en-US")).toBe(83_000);
    expect(formats.raceTime.parse(formats.raceTime.format(12_345, "en-US"), "en-US")).toBe(12_345);

    const level = formats.searchedAs((exp) => exp / 100, (exp) => `${exp / 100}✫`);
    expect(level.parse("5✫", "en-US")).toBe(500);
  });
}
