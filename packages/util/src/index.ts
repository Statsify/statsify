export type APIData = Record<string, any>;

export type Constructor<T = any> = new (...args: any[]) => T;

export const noop = <T>() => null as unknown as T;

export const findScoreIndex = <T extends { req: number }>(data: T[], score = 0): number => {
  return data.findIndex(
    ({ req }, index, arr) =>
      score >= req && ((arr[index + 1] && score < arr[index + 1].req) || !arr[index + 1])
  );
};

export const findScore = <T extends { req: number }>(data: T[], score = 0): T => {
  return data[findScoreIndex(data, score)];
};

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
