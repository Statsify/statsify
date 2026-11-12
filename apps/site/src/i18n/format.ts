/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Number formatting identical to the bot's (`@statsify/discord` i18n-loader.service.ts), kept
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

export function formatNumber(value: number, locale?: string): string {
  const hasDecimals = value >= 1_000_000 || !Number.isInteger(value);
  const digits = hasDecimals ? 2 : 0;
  const format = numberFormat(locale, digits, digits);

  if (value >= 1_000_000) {
    const [number, suffix] = abbreviationNumber(value);
    return `${format.format(number)}${suffix}`;
  }

  return format.format(value);
}

/** A countdown as `m:ss`, or `h:mm:ss` from an hour up. */
export function formatCountdown(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, "0");
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
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
}
