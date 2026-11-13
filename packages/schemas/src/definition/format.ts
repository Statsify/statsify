/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { formatRaceTime, formatTime } from "@statsify/util";

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/** `key` names the message in a locale (`errors.parse.<key>`), filled in with `params` */
export interface ParseError {
  key: "invalidNumber" | "invalidTime" | "unreachable";
  params: { input: string };
}

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

const fail = (key: ParseError["key"], input: string): Result<never, ParseError> => ({
  ok: false,
  error: { key, params: { input } },
});

export interface Format {
  format(value: number, locale: string): string;
  /** The value a leaderboard search like `1:23` or `500✫` ranks at */
  parse(input: string, locale: string): Result<number, ParseError>;
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

export function parseNumber(input: string, locale: string): Result<number, ParseError> {
  const { group, decimal } = getSeparators(locale);
  const search = input.trim().toLowerCase().replaceAll(group, "").replace(decimal, ".");

  const match = /^(\d*\.?\d+)\s*([kmb])?/.exec(search);
  if (!match) return fail("invalidNumber", input);

  const [, number, suffix] = match;
  return ok(Number(number) * (suffix ? SUFFIXES[suffix] : 1));
}

const MS_PER_UNIT: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

// Reads formatTime or formatRaceTime output, or a time like 1:23.45, back into milliseconds
function parseTime(input: string): Result<number, ParseError> {
  const units = [...input.matchAll(/(\d*\.?\d+)\s*(ms|[dhms])/g)];

  const time =
    units.length > 0 ?
      units.reduce((total, [, number, unit]) => total + Number(number) * MS_PER_UNIT[unit], 0) :
      input.split(":").reduce((total, part) => total * 60 + Number(part), 0) * 1000;

  return Number.isNaN(time) ? fail("invalidTime", input) : ok(Math.round(time));
}

function lowestScore(toSearched: (score: number) => number, searched: number) {
  let low = 0;
  let high = Number.MAX_SAFE_INTEGER;

  if (toSearched(high) < searched) return;

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
  parse: (input, locale) => {
    const searched = parseNumber(input, locale);
    if (!searched.ok) return searched;

    const score = lowestScore(toSearched, searched.value);
    return score === undefined ? fail("unreachable", input) : ok(score);
  },
});

export const formats = { time, raceTime, searchedAs };

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("parses searches back into the values they format", () => {
    expect(parseNumber("10k", "en-US")).toEqual(ok(10_000));
    expect(parseNumber("1,234.5", "en-US")).toEqual(ok(1234.5));
    expect(parseNumber("1.234,5", "de")).toEqual(ok(1234.5));
    expect(parseNumber("wins", "en-US")).toEqual(fail("invalidNumber", "wins"));

    expect(formats.time.parse("1:23", "en-US")).toEqual(ok(83_000));
    expect(formats.time.parse("1:2x", "en-US")).toEqual(fail("invalidTime", "1:2x"));
    expect(formats.raceTime.parse(formats.raceTime.format(12_345, "en-US"), "en-US")).toEqual(ok(12_345));

    const level = formats.searchedAs((exp) => Math.min(exp / 100, 10), (exp) => `${exp / 100}✫`);
    expect(level.parse("5✫", "en-US")).toEqual(ok(500));
    expect(level.parse("11✫", "en-US")).toEqual(fail("unreachable", "11✫"));
  });
}
