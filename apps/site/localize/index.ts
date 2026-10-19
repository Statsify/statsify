/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export function t(number: number): string {
  return formatNumber(number);
}

// Taken from @statsify/discord - i18n-loader.service.ts
function formatNumber(value: number, language?: string) {
  const hasDecimals = value >= 1_000_000 || !Number.isInteger(+value);
  const digits = hasDecimals ? 2 : 0;

  const formatOptions = {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  };

  if ((value as number) >= 1_000_000) {
    const [number, suffix] = abbreviationNumber(value);
    return `${Intl.NumberFormat(language, formatOptions).format(number)}${suffix}`;
  }

  return Intl.NumberFormat(language, formatOptions).format(value as number);
}

// Taken from @statsify/util. Truncates instead of rounding, so 1,999,999 is 1.99M like in the bot
function abbreviationNumber(num: number, decimals = 2): [num: number, suffix: string] {
  const abbreviation = ["", "K", "M", "B", "T"];
  const base = Math.floor(num === 0 ? 0 : Math.log(num) / Math.log(1000));
  const shiftDecimal = 10 ** decimals;
  return [
    +(Math.floor((num / Math.pow(1000, base)) * shiftDecimal) / shiftDecimal).toFixed(decimals),
    abbreviation[base],
  ];
}
