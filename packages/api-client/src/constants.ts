/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export enum GuildQuery {
  ID = "ID",
  NAME = "NAME",
  PLAYER = "PLAYER",
}

export enum CurrentHistoricalType {
  SESSION = "SESSION",
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

export enum CacheLevel {
  CACHE = "CACHE",
  CACHE_ONLY = "CACHE_ONLY",
  LIVE = "LIVE",
}

export enum LeaderboardQuery {
  PAGE = "page",
  INPUT = "input",
  POSITION = "position",
}
