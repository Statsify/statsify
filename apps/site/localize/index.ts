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

// Taken from @statsify/util
function abbreviationNumber(num: number): [num: number, suffix: string] {
  const abbreviation = ["", "K", "M", "B", "T"];
  const base = Math.floor(num === 0 ? 0 : Math.log(num) / Math.log(1000));
  return [+(num / Math.pow(1000, base)).toFixed(2), abbreviation[base]];
}
