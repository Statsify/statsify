/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export enum CurrentHistoricalType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

export enum LastHistoricalType {
  LAST_DAY = "LAST_DAY",
  LAST_WEEK = "LAST_WEEK",
  LAST_MONTH = "LAST_MONTH",
}

export const HistoricalTimes = { ...LastHistoricalType, ...CurrentHistoricalType };
export type HistoricalType = LastHistoricalType | CurrentHistoricalType;
