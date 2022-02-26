export type APIData = Record<string, any>;

/**
 *
 * @param instance A class instance
 * @returns The constructor of the instance
 */
//@ts-ignore - TS doesn't know about the constructor
export const getConstructor = <T>(instance: T): Constructor<T> => instance.constructor;
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

export const prettify = (s: string): string =>
  s
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());

export const removeFormatting = (s: string): string => s.replace(/§./g, '');

/**
 *
 * @param data The object to be flattened
 * @param prefix The prefix to be added to the keys
 * @param dest The object to be flattened into
 * @returns The flattened object
 * @example ```ts
 * flatten({ a: { b: 1, c: 2 }, d: 3 }); // { 'a.b': 1, 'a.c': 2, 'd': 3 }
 * ```
 */
export const flatten = <T>(data: T, prefix = '', dest: APIData = {}): APIData => {
  if (isObject(data)) {
    Object.keys(data ?? {}).forEach((key) => {
      const tmpPrefix = prefix.length > 0 ? prefix + '.' + key : prefix + key;
      flatten(data[key as keyof T], tmpPrefix, dest);
    });
  } else if (Array.isArray(data)) {
    data.forEach((item, i) => {
      const tmpPrefix = prefix.length > 0 ? prefix + '.' + i : prefix + i;
      flatten(item, tmpPrefix, dest);
    });
  } else {
    dest[prefix] = data;
  }

  return dest;
};

/**
 *
 * @param data The object to be unflattened
 * @example ```ts
 * unflatten({ 'stats.bedwars.wins': 1 }); // { stats: { bedwars: { wins: 1 } } }
 * ```
 */
export const unflatten = <T>(obj: APIData): T => {
  const tmp: APIData = {};
  Object.keys(obj).forEach((k) => {
    if (k.includes('.')) {
      const path = k.split('.');
      const x = path.pop();
      const body = path.reduce((cur, p) => {
        if (!(p in cur)) cur[p] = {};
        return cur[p];
      }, tmp);

      body[x ?? ''] = obj[k];
    } else {
      tmp[k] = obj[k];
    }
  });

  return tmp as T;
};

/**
 *
 * @param constructor
 * @returns An instance of the class using objects as arguments
 */
export const mockClass = <T>(constructor: Constructor<T>): T =>
  new constructor(...Array.from({ length: constructor.length }).fill({}));
