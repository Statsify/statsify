import { findScore, flatten, isObject, removeFormatting, romanNumeral } from '../src';

describe('findScore', () => {
  const scores = [{ req: 0 }, { req: 10 }, { req: 20 }, { req: 30 }];

  it('finds the correct score', () => {
    expect(findScore(scores, 25)).toMatchObject({ req: 20 });
    expect(findScore(scores, 35)).toMatchObject({ req: 30 });
    expect(findScore(scores, 0)).toMatchObject({ req: 0 });
  });
});

describe('isObject', () => {
  it('returns true for objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('returns false for arrays', () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it('returns false for other types', () => {
    expect(isObject(undefined)).toBe(false);
    expect(isObject(1)).toBe(false);
    expect(isObject('hello')).toBe(false);
  });
});

describe('romanNumeral', () => {
  it('should give the correct roman numeral', () => {
    expect(romanNumeral(1)).toBe('I');
    expect(romanNumeral(4)).toBe('IV');
    expect(romanNumeral(5)).toBe('V');
    expect(romanNumeral(6)).toBe('VI');
    expect(romanNumeral(50)).toBe('L');
    expect(romanNumeral(100)).toBe('C');
    expect(romanNumeral(99999)).toBe(
      'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMCMXCIX'
    );
  });
});

describe('removeFormatting', () => {
  it('should remove formatting', () => {
    expect(removeFormatting('§ahello§r world')).toBe('hello world');
  });
});

describe('flatten', () => {
  it('should flatten objects', () => {
    expect(flatten({ a: { b: { c: 1 } } })).toMatchObject({ 'a.b.c': 1 });
    expect(flatten({ a: { b: { c: 1, d: 2 } } })).toMatchObject({ 'a.b.c': 1, 'a.b.d': 2 });
    expect(flatten({ a: [{ b: { c: 1 } }] })).toMatchObject({ 'a.0.b.c': 1 });
  });
});
