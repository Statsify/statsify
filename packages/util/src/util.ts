/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export const noop = <T>() => null as unknown as T;

/**
 * @description Finds the element in the array where the `score` value is is greater than the `req` value but less than the next `req`.
 * @param data An array of objects with a `req` property
 * @param score The value to compare against
 * @returns The index of the element that meets the condition
 */
export const findScoreIndex = <T extends { req: number }>(
  data: T[],
  score = 0
): number =>
  data.findIndex(
    ({ req }, index, arr) =>
      score >= req &&
      ((arr[index + 1] && score < arr[index + 1].req) || !arr[index + 1])
  );

/**
 *
 * @description Finds the element in the array where the `score` value is is greater than the `req` value but less than the next `req`.
 * @param data An array of objects with a `req` property
 * @param score The value to compare against
 * @returns The element that meets the condition
 */
export const findScore = <T extends { req: number }>(data: T[], score = 0): T =>
  data[findScoreIndex(data, score)];

/**
 *
 * @param value any sort of value
 * @returns Whether or not the value is an object, not null and is not an array
 */
export const isObject = (value: any): value is object =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const romanNumeral = (num: number): string => {
  const digits = [...String(num)];
  const key = [
    "",
    "C",
    "CC",
    "CCC",
    "CD",
    "D",
    "DC",
    "DCC",
    "DCCC",
    "CM",
    "",
    "X",
    "XX",
    "XXX",
    "XL",
    "L",
    "LX",
    "LXX",
    "LXXX",
    "XC",
    "",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
  ];

  let roman = "";
  let i = 3;

  while (i--) roman = (key[+digits.pop()! + i * 10] ?? "") + roman;

  return Array.from({ length: +digits.join("") + 1 }).join("M") + roman;
};

export const prettify = (s: string): string => {
  let formatted = s;
  
  if (/[a-z]/gi.test(formatted) && formatted === formatted.toUpperCase()) {
    formatted = formatted.toLowerCase();
  }

  // Convert camelCase to Snake_Case (if applicable)
  if (!["_", " "].some((l) => s.includes(l))) {
    formatted =
      formatted.charAt(0).toLowerCase() +
      formatted.slice(1).replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  // Convert snake_case to Title Case
  return formatted
    .replaceAll("_", " ")
    .replaceAll(
      /\w\S*/g,
      (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
    );
};

export const removeFormatting = (s: string): string =>
  s.replaceAll(/§#([A-Fa-f0-9]{6})|§./gm, "");

export interface FormatTimeOptions {
  /**
   * Whether or not to use `s`, `m`, `h`, `d` or `seconds`, `minutes`, `hours`, `days`
   * @default true
   */
  short?: boolean;

  /**
   * How many units to display
   * @default 2
   *
   * @example
   * ```ts
   * formatTime(90060000 , { short: true, units: 1 })
   * // => 1d
   * ```
   *@example
   * ```ts
   * formatTime(90060000 , { short: true, units: 2 })
   * // => 1d 1h
   *```
   */
  entries?: number;
}

const MS = 1000;
const SECONDS = 60;
const MINUTES = 60;
const HOURS = 24;
const MONTHS = 30;
const YEARS = 12;

// Format milliseconds to a human readable string
export const formatTime = (
  timeMs: number,
  { short = true, entries = 2 }: FormatTimeOptions = {}
): string => {
  if (timeMs < MS) return `${timeMs}${short ? "ms" : " milliseconds"}`;

  const seconds = Math.floor(timeMs / MS);
  const minutes = Math.floor(seconds / SECONDS);
  const hours = Math.floor(minutes / MINUTES);
  const days = Math.floor(hours / HOURS);
  const months = Math.floor(days / MONTHS);
  const years = Math.floor(months / YEARS);

  const time = [
    { value: years, short: "y", long: "year" },
    { value: months % YEARS, short: "mo", long: "month" },
    { value: days % MONTHS, short: "d", long: "day" },
    { value: hours % HOURS, short: "h", long: "hour" },
    { value: minutes % MINUTES, short: "m", long: "minute" },
    { value: seconds % SECONDS, short: "s", long: "second" },
    { value: timeMs - seconds * MS, short: "ms", long: "millisecond" },
  ];

  return time
    .filter(({ value }) => value > 0)
    .map(
      (unit) =>
        `${unit.value}${short ? unit.short : ` ${unit.long}${unit.value > 1 ? "s" : ""}`}`
    )
    .splice(0, entries)
    .join(", ");
};

export const relativeTime = (time: number) =>
  `${formatTime(Date.now() - time)} ago`;

export const formatRaceTime = (timeMs: number) =>
  `${(timeMs / 1000).toFixed(3)}s`;

export const formatRecordTime = (timeMs: number) =>
  timeMs ? formatTime(timeMs) : "N/A";

export const abbreviationNumber = (
  num: number,
  decimals = 2
): [num: number, suffix: string] => {
  const abbreviation = ["", "K", "M", "B", "T"];
  const base = Math.floor(num === 0 ? 0 : Math.log(num) / Math.log(1000));
  const shiftDecimal = 10 ** decimals;
  return [
    +(
      Math.floor((num / Math.pow(1000, base)) * shiftDecimal) / shiftDecimal
    ).toFixed(decimals),
    abbreviation[base],
  ];
};

export const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const arrayGroup = <T extends Array<any> | string>(
  arr: T,
  groupSize: number
): T[] =>
  Array.from({ length: Math.ceil(arr.length / groupSize) }, (_, i) =>
    arr.slice(i * groupSize, (i + 1) * groupSize)
  ) as T[];

export const wordGroup = (
  input: string,
  wordCount: number,
  list: string[] = []
): string[] => {
  const size = wordCount * 5;

  if (input.length <= size) {
    list.push(input);
    return list;
  }

  let line = input.slice(0, Math.max(0, size));

  const lastSpaceRgx = /\s(?!.*\s)/;
  const index = line.search(lastSpaceRgx) + 1;
  let nextIndex = size;

  if (index > 0) {
    line = line.slice(0, Math.max(0, index));
    nextIndex = index;
  }

  list.push(line);

  return wordGroup(input.slice(Math.max(0, nextIndex)), wordCount, list);
};

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("findScore", () => {
    const scores = [{ req: 0 }, { req: 10 }, { req: 20 }, { req: 30 }];

    it("finds the correct score", () => {
      expect(findScore(scores, 25)).toMatchObject({ req: 20 });
      expect(findScore(scores, 35)).toMatchObject({ req: 30 });
      expect(findScore(scores, 0)).toMatchObject({ req: 0 });
    });
  });

  suite("findScoreIndex", () => {
    it("finds the index of the last req the score reaches", () => {
      const scores = [{ req: 5 }, { req: 10 }, { req: 20 }];

      expect(findScoreIndex(scores, 4)).toBe(-1);
      expect(findScoreIndex(scores)).toBe(-1);
      expect(findScoreIndex(scores, 5)).toBe(0);
      expect(findScoreIndex(scores, 19)).toBe(1);
      expect(findScoreIndex(scores, 20)).toBe(2);
      expect(findScoreIndex(scores, 1000)).toBe(2);
    });
  });

  suite("isObject", () => {
    it("returns true for objects", () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });

    it("returns false for null", () => {
      expect(isObject(null)).toBe(false);
    });

    it("returns false for arrays", () => {
      expect(isObject([])).toBe(false);
      expect(isObject([1, 2, 3])).toBe(false);
    });

    it("returns false for other types", () => {
      expect(isObject(undefined)).toBe(false);
      expect(isObject(1)).toBe(false);
      expect(isObject("hello")).toBe(false);
    });
  });

  suite("romanNumeral", () => {
    it("should give the correct roman numeral", () => {
      expect(romanNumeral(-1)).toBe("I");
      expect(romanNumeral(1)).toBe("I");
      expect(romanNumeral(4)).toBe("IV");
      expect(romanNumeral(5)).toBe("V");
      expect(romanNumeral(6)).toBe("VI");
      expect(romanNumeral(50)).toBe("L");
      expect(romanNumeral(100)).toBe("C");
      expect(romanNumeral(99_999)).toBe(
        "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMCMXCIX"
      );
    });
  });

  suite("prettify", () => {
    it("should format the string in a nice way", () => {
      expect(prettify("normal")).toBe("Normal");
      expect(prettify("two words")).toBe("Two Words");
      expect(prettify("snake_case")).toBe("Snake Case");
      expect(prettify("double__snake__case")).toBe("Double  Snake  Case");
      expect(prettify("switchy_Snake_Case")).toBe("Switchy Snake Case");
      expect(prettify("CAPS_SNAKE_CASE")).toBe("Caps Snake Case");
      expect(prettify("camelCase")).toBe("Camel Case");
      expect(prettify("Pascal Case")).toBe("Pascal Case");
      expect(prettify("sTuDlY cAPs")).toBe("Studly Caps");
    });
  });

  suite("removeFormatting", () => {
    it("should remove formatting", () => {
      expect(removeFormatting("§ahello§r world")).toBe("hello world");
      expect(removeFormatting("hello world")).toBe("hello world");
    });
  });

  suite("formatTime", () => {
    it("should format time", () => {
      const milliseconds = 500;
      const second = 1000;
      const minute = 60 * second;
      const hour = 60 * minute;
      const day = 24 * hour;

      expect(formatTime(0, { short: false, entries: 4 })).toBe(
        "0 milliseconds"
      );
      expect(formatTime(second, { short: false, entries: 4 })).toBe("1 second");
      expect(
        formatTime(second + milliseconds, { short: false, entries: 4 })
      ).toBe("1 second, 500 milliseconds");
      expect(formatTime(second * 2, { short: false, entries: 4 })).toBe(
        "2 seconds"
      );
      expect(formatTime(minute, { short: false, entries: 4 })).toBe("1 minute");
      expect(formatTime(hour, { short: false, entries: 4 })).toBe("1 hour");
      expect(formatTime(day, { short: false, entries: 4 })).toBe("1 day");
      expect(
        formatTime(day + hour + minute + second, { short: false, entries: 4 })
      ).toBe("1 day, 1 hour, 1 minute, 1 second");
      expect(
        formatTime((day + hour + minute + second) * 2, {
          short: false,
          entries: 4,
        })
      ).toBe("2 days, 2 hours, 2 minutes, 2 seconds");

      expect(formatTime(0, { short: true, entries: 4 })).toBe("0ms");
      expect(formatTime(second, { short: true, entries: 4 })).toBe("1s");
      expect(formatTime(second * 2, { short: true, entries: 4 })).toBe("2s");
      expect(formatTime(minute, { short: true, entries: 4 })).toBe("1m");
      expect(formatTime(hour, { short: true, entries: 4 })).toBe("1h");
      expect(formatTime(day, { short: true, entries: 4 })).toBe("1d");
      expect(
        formatTime(day + hour + minute + second, { short: true, entries: 4 })
      ).toBe("1d, 1h, 1m, 1s");
      expect(
        formatTime((day + hour + minute + second) * 2, {
          short: true,
          entries: 4,
        })
      ).toBe("2d, 2h, 2m, 2s");
      expect(
        formatTime((day + hour + minute + second) * 2, {
          short: true,
          entries: 2,
        })
      ).toBe("2d, 2h");
    });
  });

  suite("relativeTime", () => {
    it("formats the time since a timestamp", () => {
      expect(relativeTime(Date.now() - 90_000)).toBe("1m, 30s ago");
    });
  });

  suite("formatRaceTime", () => {
    it("formats milliseconds as seconds to three decimals", () => {
      expect(formatRaceTime(0)).toBe("0.000s");
      expect(formatRaceTime(1000)).toBe("1.000s");
      expect(formatRaceTime(65_432)).toBe("65.432s");
    });
  });

  suite("formatRecordTime", () => {
    it("formats the time, or N/A when there is no record", () => {
      expect(formatRecordTime(0)).toBe("N/A");
      expect(formatRecordTime(90_000)).toBe("1m, 30s");
    });
  });

  suite("abbreviationNumber", () => {
    it("splits a number into a value and a suffix, rounding down", () => {
      expect(abbreviationNumber(0)).toEqual([0, ""]);
      expect(abbreviationNumber(999)).toEqual([999, ""]);
      expect(abbreviationNumber(1000)).toEqual([1, "K"]);
      expect(abbreviationNumber(1999)).toEqual([1.99, "K"]);
      expect(abbreviationNumber(1999, 1)).toEqual([1.9, "K"]);
      expect(abbreviationNumber(1_000_000)).toEqual([1, "M"]);
      expect(abbreviationNumber(2_500_000_000)).toEqual([2.5, "B"]);
      expect(abbreviationNumber(1_000_000_000_000)).toEqual([1, "T"]);
    });
  });

  suite("ordinal", () => {
    it("adds the English ordinal suffix", () => {
      expect(ordinal(0)).toBe("0th");
      expect(ordinal(1)).toBe("1st");
      expect(ordinal(2)).toBe("2nd");
      expect(ordinal(3)).toBe("3rd");
      expect(ordinal(4)).toBe("4th");
      expect(ordinal(11)).toBe("11th");
      expect(ordinal(12)).toBe("12th");
      expect(ordinal(13)).toBe("13th");
      expect(ordinal(21)).toBe("21st");
      expect(ordinal(102)).toBe("102nd");
      expect(ordinal(111)).toBe("111th");
    });
  });

  suite("arrayGroup", () => {
    it("splits an array or string into groups of a size", () => {
      expect(arrayGroup([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(arrayGroup([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
      expect(arrayGroup("abcdef", 4)).toEqual(["abcd", "ef"]);
      expect(arrayGroup([], 3)).toEqual([]);
    });
  });

  suite("wordGroup", () => {
    it("breaks text into lines of about five characters per word", () => {
      expect(wordGroup("short", 2)).toEqual(["short"]);
      expect(wordGroup("the quick brown fox", 2)).toEqual(["the quick ", "brown fox"]);
      expect(wordGroup("abcdefghijkl", 1)).toEqual(["abcde", "fghij", "kl"]);
    });
  });
}
