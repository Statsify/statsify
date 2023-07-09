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
 * @returns The value of the fraction * the `multiply` value rounded to 2 decimal places
 */
export const ratio = (n1 = 0, n2 = 0, multiply = 1) =>
  Number.isFinite(n1 / n2)
    ? roundTo((n1 / n2) * multiply)
    : n1 === 0 && n2 === 0
    ? 0
    : roundTo(n1 * multiply) || 0;

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
  const obj: Record<string, unknown> = {};

  for (const key in args[0]) {
    obj[key] = isObject(args[0][key])
      ? deep(fn, ...args.map((a) => a[key]))
      : fn(...args.map((a) => a[key] as unknown as number));
  }

  return obj as T;
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
  const { test, it, expect } = import.meta.vitest;

  test("basic math", () => {
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
      expect(ratio(1, undefined)).toBe(1);
      expect(ratio(1, 0)).toBe(1);
      expect(ratio(Number.NaN, 1)).toBe(0);
    });
  });

  test("math with classes", () => {
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
}
