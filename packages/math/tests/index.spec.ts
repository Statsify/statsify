/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { add, deepAdd, deepSub, ratio, sub } from "../src";

describe("basic math", () => {
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

describe("math with classes", () => {
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
