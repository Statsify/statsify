import { add, deepAdd, deepSub, ratio, sub } from '../src';

describe('basic math', () => {
  it('should add numbers together', () => {
    expect(add(1, 2)).toBe(3);
    expect(add(1, 2, 3)).toBe(6);
    expect(add(1, 2, undefined)).toBe(3);
  });

  it('should subtract numbers', () => {
    expect(sub(1, 2)).toBe(-1);
    expect(sub(1, 2, 3)).toBe(-4);
    expect(sub(1, 2, undefined)).toBe(-1);
  });

  it('should calculate ratios', () => {
    expect(ratio(1, 2)).toBe(0.5);
    expect(ratio(1, undefined)).toBe(1);
    expect(ratio(1, 0)).toBe(1);
  });
});

describe('math with classes', () => {
  class TestClass {
    public constructor(public a: number, public b: number) {}
  }

  const a = new TestClass(1, 2);
  const b = new TestClass(1, 2);

  it('should add numbers together', () => {
    expect(deepAdd(TestClass, a, b)).toBeInstanceOf(TestClass);
    expect(deepAdd(TestClass, a, b)).toMatchObject(new TestClass(2, 4));
  });

  it('should subtract numbers', () => {
    expect(deepSub(TestClass, a, b)).toBeInstanceOf(TestClass);
    expect(deepSub(TestClass, a, b)).toMatchObject(new TestClass(0, 0));
  });
});
