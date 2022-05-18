import {
  findScore,
  flatten,
  formatTime,
  isObject,
  mockClass,
  noop,
  prettify,
  removeFormatting,
  romanNumeral,
  unflatten,
} from '../src';

describe('findScore', () => {
  const scores = [{ req: 0 }, { req: 10 }, { req: 20 }, { req: 30 }];

  it('finds the correct score', () => {
    expect(findScore(scores, 25)).toMatchObject({ req: 20 });
    expect(findScore(scores, 35)).toMatchObject({ req: 30 });
    expect(findScore(scores, 0)).toMatchObject({ req: 0 });
  });
});

describe('isNull', () => {
  it('returns null', () => {
    expect(noop).toBeInstanceOf(Function);

    const test = noop();
    expect(test).toBeNull();
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
    expect(romanNumeral(-1)).toBe('I');
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

describe('prettify', () => {
  it('should format the string in a nice way', () => {
    expect(prettify('normal')).toBe('Normal');
    expect(prettify('two words')).toBe('Two Words');
    expect(prettify('snake_case')).toBe('Snake Case');
    expect(prettify('double__snake__case')).toBe('Double  Snake  Case');
    expect(prettify('switchy_Snake_Case')).toBe('Switchy Snake Case');
    expect(prettify('CAPS_SNAKE_CASE')).toBe('Caps Snake Case');
    expect(prettify('camelCase')).toBe('Camel Case');
    expect(prettify('Pascal Case')).toBe('Pascal Case');
    expect(prettify('sTuDlY cAPs')).toBe('Studly Caps');
  });
});

describe('removeFormatting', () => {
  it('should remove formatting', () => {
    expect(removeFormatting('§ahello§r world')).toBe('hello world');
    expect(removeFormatting('hello world')).toBe('hello world');
  });
});

describe('flatten', () => {
  it('should flatten objects', () => {
    expect(flatten({ a: 1 })).toMatchObject({ a: 1 });
    expect(flatten({ a: { b: { c: 1 } } })).toMatchObject({ 'a.b.c': 1 });
    expect(flatten({ a: { b: { c: 1, d: 2 } } })).toMatchObject({ 'a.b.c': 1, 'a.b.d': 2 });
    expect(flatten({ a: [{ b: { c: 1 } }] })).toMatchObject({ a: [{ b: { c: 1 } }] });
  });
});

describe('unflatten', () => {
  it('should unflatten objects', () => {
    expect(unflatten({ a: 1 })).toMatchObject({ a: 1 });
    expect(unflatten({ 'a.b.c': 1 })).toMatchObject({ a: { b: { c: 1 } } });
    expect(unflatten({ 'a.b.c': 1, 'a.b.d': 2 })).toMatchObject({ a: { b: { c: 1, d: 2 } } });
    expect(unflatten({ a: [{ b: { c: 1 } }] })).toMatchObject({ a: [{ b: { c: 1 } }] });
  });
});

describe('mockClass', () => {
  it("should create instances of classes that don't rely on methods of parameters", () => {
    class Test {
      public constructor(public a: string) {
        a[0];
      }
    }

    const mock = mockClass(Test);

    expect(mock).toBeInstanceOf(Test);
  });
});

describe('formatTime', () => {
  it('should format time', () => {
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;

    expect(formatTime(0, { short: false, entries: 4 })).toBe('0ms');
    expect(formatTime(second, { short: false, entries: 4 })).toBe('1 second');
    expect(formatTime(second * 2, { short: false, entries: 4 })).toBe('2 seconds');
    expect(formatTime(minute, { short: false, entries: 4 })).toBe('1 minute');
    expect(formatTime(hour, { short: false, entries: 4 })).toBe('1 hour');
    expect(formatTime(day, { short: false, entries: 4 })).toBe('1 day');
    expect(formatTime(day + hour + minute + second, { short: false, entries: 4 })).toBe(
      '1 day, 1 hour, 1 minute, 1 second'
    );
    expect(formatTime((day + hour + minute + second) * 2, { short: false, entries: 4 })).toBe(
      '2 days, 2 hours, 2 minutes, 2 seconds'
    );

    expect(formatTime(0, { short: true, entries: 4 })).toBe('0ms');
    expect(formatTime(second, { short: true, entries: 4 })).toBe('1s');
    expect(formatTime(second * 2, { short: true, entries: 4 })).toBe('2s');
    expect(formatTime(minute, { short: true, entries: 4 })).toBe('1m');
    expect(formatTime(hour, { short: true, entries: 4 })).toBe('1h');
    expect(formatTime(day, { short: true, entries: 4 })).toBe('1d');
    expect(formatTime(day + hour + minute + second, { short: true, entries: 4 })).toBe(
      '1d, 1h, 1m, 1s'
    );
    expect(formatTime((day + hour + minute + second) * 2, { short: true, entries: 4 })).toBe(
      '2d, 2h, 2m, 2s'
    );
    expect(formatTime((day + hour + minute + second) * 2, { short: true, entries: 2 })).toBe(
      '2d, 2h'
    );
  });
});
