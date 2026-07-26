/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export const compact = (n: number): string => {
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${sign}${abs}`;
};

export const fixedDecimal = (n: number, digits = 2): string => {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(digits);
};

export const ratioFormat = (n: number, digits = 2): string => fixedDecimal(n, digits);
