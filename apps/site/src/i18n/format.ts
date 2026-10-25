/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * The bot's number format (`formatNumber` in `@statsify/util` util.ts) plus a `trim` option, kept
 * here because `@statsify/util` pulls `config.ts` and `node:fs` into the browser bundle.
 */

const ABBREVIATIONS = ["", "K", "M", "B", "T"];

function abbreviationNumber(num: number, decimals = 2): [num: number, suffix: string] {
  const base = Math.floor(num === 0 ? 0 : Math.log(num) / Math.log(1000));
  const shift = 10 ** decimals;
  return [+(Math.floor((num / 1000 ** base) * shift) / shift).toFixed(decimals), ABBREVIATIONS[base]];
}

const numberFormats = new Map<string, Intl.NumberFormat>();

/** Kept per locale and digits: making one costs far more than formatting with it, and a page formats hundreds. */
function numberFormat(locale: string | undefined, maximumFractionDigits: number, minimumFractionDigits?: number) {
  const key = `${locale}|${maximumFractionDigits}|${minimumFractionDigits}`;
  let format = numberFormats.get(key);
  if (!format) numberFormats.set(key, (format = Intl.NumberFormat(locale, { maximumFractionDigits, minimumFractionDigits })));
  return format;
}

/** `trim` prints only the decimals a number has, as the bot prints one it doesn't format (Quake's Trigger, `1.3`). */
export function formatNumber(value: number, locale?: string, trim = false): string {
  const hasDecimals = value >= 1_000_000 || !Number.isInteger(value);
  const digits = hasDecimals ? 2 : 0;
  const format = numberFormat(locale, digits, trim ? 0 : digits);

  if (value >= 1_000_000) {
    const [number, suffix] = abbreviationNumber(value);
    return `${format.format(number)}${suffix}`;
  }

  return format.format(value);
}

/** The exact number where `formatNumber` shortens it (a million and up), else nothing: `1234567` → "1,234,567". */
export function exactNumber(value: number, locale?: string): string | undefined {
  if (value < 1_000_000) return undefined;
  return numberFormat(locale, 2).format(value);
}

/**
 * A moment to the minute in the zone `Intl` runs in, the browser's own after mount: "Saturday, October 24, 2026 at 8:30
 * PM EDT", or with `short` "Sat, Oct 24, 2026, 8:30 PM EDT". Its own fields, since `dateStyle` can't take `timeZoneName`.
 */
export function fullDate(ms: number, locale?: string, short = false): string {
  const name = short ? "short" : "long";
  return new Intl.DateTimeFormat(locale, {
    weekday: name,
    month: name,
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(ms);
}

/** A countdown as `m:ss`, or `h:mm:ss` from an hour up. */
export function formatCountdown(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, "0");
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

/**
 * How long ago `then` was, in the locale's words ("3 hours ago", "last month", "11 years ago"; "3h ago" with `style`
 * narrow). Days up to 25, months up to 10, then years, so it never says "12 months ago".
 */
export function relativeTime(
  then: number,
  now: number,
  locale?: string,
  { style = "long" }: { style?: Intl.RelativeTimeFormatStyle } = {}
): string {
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style });
  // A visitor's clock behind the server's would put `then` ahead of `now` ("in 8 seconds").
  const seconds = Math.round(Math.min(0, then - now) / 1000);
  const magnitude = Math.abs(seconds);
  const days = seconds / 86_400;

  if (magnitude < 60) return format.format(seconds, "second");
  if (magnitude < 3600) return format.format(Math.round(seconds / 60), "minute");
  if (magnitude < 86_400) return format.format(Math.round(seconds / 3600), "hour");
  if (magnitude < 26 * 86_400) return format.format(Math.round(days), "day");
  if (magnitude < 320 * 86_400) return format.format(Math.round(days / 30.4375), "month");
  return format.format(Math.round(days / 365.25), "year");
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("formatNumber", () => {
    it("matches the bot's number format", () => {
      expect(formatNumber(0, "en-US")).toBe("0");
      expect(formatNumber(1234, "en-US")).toBe("1,234");
      expect(formatNumber(12.5, "en-US")).toBe("12.50");
      expect(formatNumber(1_234_567, "en-US")).toBe("1.23M");
      expect(formatNumber(2_500_000_000, "en-US")).toBe("2.50B");
      expect(formatNumber(1234, "de")).toBe("1.234");
      expect(formatNumber(1.3, "en-US", true)).toBe("1.3");
      expect(formatNumber(0.85, "en-US", true)).toBe("0.85");
    });
  });

  describe("exactNumber", () => {
    it("spells out exactly the numbers formatNumber shortens", () => {
      expect(exactNumber(999_999, "en-US")).toBeUndefined();
      expect(exactNumber(1_000_000, "en-US")).toBe("1,000,000");
      expect(exactNumber(1_234_567.891, "en-US")).toBe("1,234,567.89");
    });
  });

  describe("formatCountdown", () => {
    it("shows m:ss, and hours once there are any", () => {
      expect(formatCountdown(0)).toBe("0:00");
      expect(formatCountdown(59.2)).toBe("1:00");
      expect(formatCountdown(3599)).toBe("59:59");
      expect(formatCountdown(21_536)).toBe("5:58:56");
    });
  });

  describe("relativeTime", () => {
    it("rounds to the largest unit, up to years", () => {
      const now = Date.UTC(2026, 9, 24);
      expect(relativeTime(now - 3 * 3_600_000, now, "en-US")).toBe("3 hours ago");
      expect(relativeTime(now - 25 * 86_400_000, now, "en-US")).toBe("25 days ago");
      expect(relativeTime(now - 364 * 86_400_000, now, "en-US")).toBe("last year");
      expect(relativeTime(Date.UTC(2015, 10, 6), now, "en-US")).toBe("11 years ago");
    });
  });
}
