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
export const findScoreIndex = <T extends { req: number }>(data: T[], score = 0): number => {
  return data.findIndex(
    ({ req }, index, arr) =>
      score >= req && ((arr[index + 1] && score < arr[index + 1].req) || !arr[index + 1])
  );
};

/**
 *
 * @description Finds the element in the array where the `score` value is is greater than the `req` value but less than the next `req`.
 * @param data An array of objects with a `req` property
 * @param score The value to compare against
 * @returns The element that meets the condition
 */
export const findScore = <T extends { req: number }>(data: T[], score = 0): T => {
  return data[findScoreIndex(data, score)];
};

/**
 *
 * @param value any sort of value
 * @returns Whether or not the value is an object, not null and is not an array
 */
export const isObject = (value: any): value is object =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const romanNumeral = (num: number): string => {
  const digits = String(num).split('');
  const key = [
    '',
    'C',
    'CC',
    'CCC',
    'CD',
    'D',
    'DC',
    'DCC',
    'DCCC',
    'CM',
    '',
    'X',
    'XX',
    'XXX',
    'XL',
    'L',
    'LX',
    'LXX',
    'LXXX',
    'XC',
    '',
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
  ];

  let roman = '';
  let i = 3;

  while (i--) roman = (key[+digits.pop()! + i * 10] ?? '') + roman;

  return Array(+digits.join('') + 1).join('M') + roman;
};

export const prettify = (s: string): string => {
  let newString = s;

  // Convert camelCase to Snake_Case (if applicable)
  if (!['_', ' '].some((s) => newString.includes(s))) {
    newString =
      newString.charAt(0).toLowerCase() +
      newString.substring(1).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  // Convert snake_case to Title Case
  return newString
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());
};

export const removeFormatting = (s: string): string => s.replace(/§./g, '');

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

  accuracy?: 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
}

//Format milliseconds to a human readable string
export const formatTime = (
  ms: number,
  { short = true, entries = 2, accuracy = 'millisecond' }: FormatTimeOptions = {}
): string => {
  if (ms < 1000) return `${ms}${short ? 'ms' : ' milliseconds'}`;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let time = [
    { value: days, short: 'd', long: 'day' },
    { value: hours % 24, short: 'h', long: 'hour' },
    { value: minutes % 60, short: 'm', long: 'minute' },
    { value: seconds % 60, short: 's', long: 'second' },
    { value: ms - seconds * 1000, short: 'ms', long: 'millisecond' },
  ];

  time = time.slice(0, time.findIndex((v) => v.long == accuracy) + 1);

  return time
    .filter(({ value }) => value > 0)
    .map(
      (unit) => `${unit.value}${short ? unit.short : ` ${unit.long}${unit.value > 1 ? 's' : ''}`}`
    )
    .splice(0, entries)
    .join(', ');
};

export const abbreviationNumber = (num: number): string => {
  const abbreviation = ['', '', 'M', 'B', 'T'];
  const base = Math.floor(Math.log(num) / Math.log(1000));
  return `${(num / Math.pow(1000, base)).toFixed(2)}${abbreviation[base]}`;
};

export * from './flat';
export * from './minecraft-colors';
