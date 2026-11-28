/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// Early Spring 1 of year 1 began on 2019-06-11 at 17:55 UTC.
const EPOCH_MS = 1_560_275_700_000;
const DAY_MS = 20 * 60_000;
const MONTH_DAYS = 31;

const SKYBLOCK_MONTHS = [
  "earlySpring",
  "spring",
  "lateSpring",
  "earlySummer",
  "summer",
  "lateSummer",
  "earlyAutumn",
  "autumn",
  "lateAutumn",
  "earlyWinter",
  "winter",
  "lateWinter",
] as const;

const YEAR_DAYS = SKYBLOCK_MONTHS.length * MONTH_DAYS;

export interface SkyBlockDate {
  year: number;
  // Months count from 0, Early Spring, and days from 1.
  month: number;
  day: number;
}

export const getDayStart = ({ year, month, day }: SkyBlockDate) =>
  EPOCH_MS + ((year - 1) * YEAR_DAYS + month * MONTH_DAYS + day - 1) * DAY_MS;
