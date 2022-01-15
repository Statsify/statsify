export const ratio = (n1 = 0, n2 = 0, multiply = 1) =>
  +(isFinite(n1 / n2)
    ? +((n1 / n2) * multiply).toFixed(2)
    : n1 === 0 && n2 === 0
    ? 0
    : (+n1 * multiply).toFixed(2));

export const add = (...args: number[]): number => args.reduce((a, b) => (a ?? 0) + (b ?? 0), 0);

export const sub = (...args: number[]): number => args.reduce((a, b) => (a ?? 0) - (b ?? 0));

export const radians = (deg: number): number => (deg * Math.PI) / 180;

const deep = <T>(fn: (...args: number[]) => unknown, ...args: T[]): T => {
  const obj: Record<string, unknown> = {};

  for (const key in args[0]) {
    if (typeof args[0][key] === 'object') {
      obj[key] = deep(fn, ...args.map((a) => a[key]));
    } else {
      obj[key] = fn(...args.map((a) => a[key] as unknown as number));
    }
  }

  return obj as T;
};

export const deepAdd = <T>(...args: T[]): T => deep(add, ...args);
export const deepSub = <T>(...args: T[]): T => deep(sub, ...args);
