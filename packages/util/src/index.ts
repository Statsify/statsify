/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export type APIData = Record<string, any>;

export type RemoveMethods<T> = Pick<
  T,
  // eslint-disable-next-line @typescript-eslint/ban-types
  { [Key in keyof T]: T[Key] extends Function ? never : Key }[keyof T]
>;

export type Constructor<T = any> = new (...args: any[]) => T;

export const noop = <T>() => null as unknown as T;

/**
 * @description Finds the element in the array where the `score` value is is greater than the `req` value but less than the next `req`.
 * @param data An array of objects with a `req` property
 * @param score The value to compare against
 * @returns The index of the element that meets the condition
 */
export const findScoreIndex = <T extends { req: number }>(data: T[], score = 0): number =>
  data.findIndex(
    ({ req }, index, arr) =>
      score >= req && ((arr[index + 1] && score < arr[index + 1].req) || !arr[index + 1])
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
  if (/[a-z]/gi.test(s) && s === s.toUpperCase()) {
    s = s.toLowerCase();
  }

  // Convert camelCase to Snake_Case (if applicable)
  if (!["_", " "].some((l) => s.includes(l))) {
    s =
      s.charAt(0).toLowerCase() +
      s.slice(1).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  // Convert snake_case to Title Case
  return s
    .replaceAll("_", " ")
    .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
};

export const removeFormatting = (s: string): string => s.replace(/§./g, "");

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

//Format milliseconds to a human readable string
export const formatTime = (
  ms: number,
  { short = true, entries = 2 }: FormatTimeOptions = {}
): string => {
  if (ms < 1000) return `${ms}${short ? "ms" : " milliseconds"}`;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const time = [
    { value: days, short: "d", long: "day" },
    { value: hours % 24, short: "h", long: "hour" },
    { value: minutes % 60, short: "m", long: "minute" },
    { value: seconds % 60, short: "s", long: "second" },
    { value: ms - seconds * 1000, short: "ms", long: "millisecond" },
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

export const relativeTime = (time: number) => `${formatTime(Date.now() - time)} ago`;

export const abbreviationNumber = (num: number): string => {
  const abbreviation = ["", "", "M", "B", "T"];
  const base = Math.floor(Math.log(num) / Math.log(1000));
  return `${(num / Math.pow(1000, base)).toFixed(2)}${abbreviation[base]}`;
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

export * from "./flat";
export * from "./minecraft-colors";
export * from "./env";
