import { Constructor, isObject } from '@statsify/util';

export const ratio = (n1 = 0, n2 = 0, multiply = 1) =>
  +(isFinite(n1 / n2)
    ? +((n1 / n2) * multiply).toFixed(2)
    : n1 === 0 && n2 === 0
    ? 0
    : (+n1 * multiply).toFixed(2));

export const add = (...args: number[]): number => args.reduce((a, b) => (a ?? 0) + (b ?? 0), 0);

export const sub = (...args: number[]): number => args.reduce((a, b) => (a ?? 0) - (b ?? 0));

export const radians = (deg: number): number => (deg * Math.PI) / 180;

const deep = <T>(
  fn: (...args: number[]) => unknown,
  constructor: Constructor<T>,
  ...args: T[]
): T => {
  const obj: Record<string, unknown> = {};

  for (const key in args[0]) {
    if (isObject(args[0][key])) {
      //@ts-ignore - TS doesn't know about the constructor
      const constructor = args[0][key].constructor;
      obj[key] = deep(fn, constructor, ...args.map((a) => a[key]));
    } else {
      obj[key] = fn(...args.map((a) => a[key] as unknown as number));
    }
  }

  Object.setPrototypeOf(obj, constructor.prototype);

  return obj as T;
};

export const deepAdd = <T>(constructor: Constructor<T>, ...args: T[]): T =>
  deep(add, constructor, ...args);

export const deepSub = <T>(constructor: Constructor<T>, ...args: T[]): T =>
  deep(sub, constructor, ...args);
