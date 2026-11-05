/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { isObject } from "@statsify/util";

/**
 *
 * @param n The number to round
 * @param precision How many digits to round to
 * @returns The rounded number
 */
export const roundTo = (n: number, precision = 2) => {
  const factor = Math.pow(10, precision);
  return Math.round(n * factor) / factor;
};

/**
 *
 * @param n1 The numerator of the fraction
 * @param n2 The denominator of the fraction
 * @param multiply Whether to multiply the numerator and denominator, useful for percents, such as `bowAccuracy`
 * @returns The value of the fraction * the `multiply` value without rounding
 */
export const unroundedRatio = (n1 = 0, n2 = 0, multiply = 1) => {
  const result = n1 / n2;

  if (Number.isFinite(result)) return result * multiply;

  return n1 * multiply || 0;
};

/**
 *
 * @param n1 The numerator of the fraction
 * @param n2 The denominator of the fraction
 * @param multiply Whether to multiply the numerator and denominator, useful for percents, such as `bowAccuracy`
 * @returns The value of the fraction * the `multiply` value rounded to 2 decimal places
 */
export const ratio = (n1 = 0, n2 = 0, multiply = 1) =>
  roundTo(unroundedRatio(n1, n2, multiply));

/**
 *
 * @param n1 The numerator of the ratio
 * @param n2 The denominator of the ratio
 * @returns An estimate of the numerator when the ratio reaches its next whole number, playing at 1.5x that ratio from now on
 */
export const estimateAtNextRatio = (n1 = 0, n2 = 0) => {
  const denominator = Math.max(n2, 1);
  const target = Math.floor(unroundedRatio(n1, n2)) + 1;
  const needed = target * denominator - n1;

  // At 1.5x the target, the n2 gained on the way costs another 2 * needed
  return target * denominator + 2 * needed;
};

export const add = (...args: number[]): number =>
  args.reduce((a, b) => (a ?? 0) + (b ?? 0), 0);

export const sub = (...args: number[]): number =>
  args.reduce((a, b) => (a ?? 0) - (b ?? 0));

/**
 *
 * @param fn The function to call on all non object values
 * @param constructor The constructor to create an instance of
 * @param args An array of instances of the constructor
 * @returns A new instance of the constructor with all non object values manipulated by the `fn` function
 */
const deep = <T>(fn: (...args: number[]) => unknown, ...args: T[]): T => {
  const object: Record<string, unknown> = {};

  for (const key in args[0]) {
    object[key] = isObject(args[0][key]) ?
      deep(fn, ...args.map((a) => a[key])) :
      fn(...args.map((a) => a[key] as unknown as number));
  }

  return object as T;
};

/**
 *
 * @param constructor The constructor to create an instance of
 * @param args An array of instances of the constructor
 * @returns A new instance of the constructor with all non object values added together into a single object
 * @example ```ts
 * const obj = deepAdd(SomeClass, new SomeClass({ a: 1, b: 2 }), new SomeClass({ a: 3, b: 4 })); //SomeClass { a: 4, b: 6 }
 * ```
 */
export const deepAdd = <T>(...args: T[]): T => deep(add, ...args);

/**
 *
 * @param constructor The constructor to create an instance of
 * @param args An array of instances of the constructor
 * @returns A new instance of the constructor with all non object values subtracted into a single object
 * @example ```ts
 * const obj = deepSub(SomeClass, new SomeClass({ a: 1, b: 2 }), new SomeClass({ a: 3, b: 4 })); //SomeClass { a: -2, b: -2 }
 * ```
 */
export const deepSub = <T>(...args: T[]): T => deep(sub, ...args);

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  const zeroLoss = (n1: number, n2: number) => {
    const target = Math.floor(unroundedRatio(n1, n2)) + 1;
    return { target, total: target * Math.max(n2, 1) };
  };

  suite("basic math", () => {
    it("should add numbers together", () => {
      expect(add(1, 2)).toBe(3);
      expect(add(1, 2, 3)).toBe(6);
      expect(add(1, 2, undefined as unknown as number)).toBe(3);
    });

    it("should subtract numbers", () => {
      expect(sub(2, 1)).toBe(1);
      expect(sub(1, 2)).toBe(-1);
      expect(sub(1, 2, 3)).toBe(-4);
      expect(sub(1, 2, undefined as unknown as number)).toBe(-1);
    });

    it("should calculate ratios", () => {
      expect(ratio(1, 2)).toBe(0.5);
      expect(ratio(1, 3)).toBe(0.33);
      expect(ratio(1)).toBe(1);
      expect(ratio(1, 0)).toBe(1);
      expect(ratio(Number.NaN, 1)).toBe(0);
    });
  });

  suite("math with classes", () => {
    class TestClass {
      public constructor(public a: number, public b: number) {}
    }

    const a = new TestClass(1, 2);
    const b = new TestClass(1, 2);
    it("should add numbers together", () => {
      expect(deepAdd(a, b)).toMatchObject(new TestClass(2, 4));
    });

    it("should subtract numbers", () => {
      expect(deepSub(a, b)).toMatchObject(new TestClass(0, 0));
    });
  });

  suite("estimateAtNextRatio", () => {
    const cases = [[527, 264], [100, 100], [1000, 100], [10, 100], [0, 0], [5, 0], [3, 2]];

    it("should never estimate below the zero-loss total", () => {
      for (const [n1, n2] of cases)
        expect(estimateAtNextRatio(n1, n2)).toBeGreaterThanOrEqual(zeroLoss(n1, n2).total);
    });

    it("should land within 2 of the zero-loss total one win away", () => {
      expect(estimateAtNextRatio(527, 264)).toBe(530);
      expect(estimateAtNextRatio(99_999, 1000)).toBe(100_002);
    });

    it("should not decrease as more of the numerator is needed", () => {
      expect([199, 150, 100].map((n1) => estimateAtNextRatio(n1, 100))).toEqual([202, 300, 400]);
    });

    it("should imply a finite pace above the target", () => {
      for (const [n1, n2] of cases) {
        const { target, total } = zeroLoss(n1, n2);
        const pace = target + (target * (total - n1)) / (estimateAtNextRatio(n1, n2) - total);
        expect(pace).toBe(1.5 * target);
      }
    });

    it("should handle empty, unbeaten, whole, high and tiny ratios", () => {
      expect(estimateAtNextRatio(0, 100)).toBe(300);
      expect(estimateAtNextRatio(5, 0)).toBe(8);
      expect(estimateAtNextRatio(0, 0)).toBe(3);
      expect(estimateAtNextRatio(300, 100)).toBe(600);
      expect(estimateAtNextRatio(6000, 100)).toBe(6300);
      expect(estimateAtNextRatio(3, 2)).toBe(6);
    });

    it("should scale with games played at the same ratio", () => {
      expect(estimateAtNextRatio(1000, 1000)).toBe(10 * estimateAtNextRatio(100, 100));
    });
  });
}
