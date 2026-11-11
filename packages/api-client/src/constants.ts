/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export const GuildQuery = {
  ID: "ID",
  NAME: "NAME",
  PLAYER: "PLAYER",
} as const;

export type GuildQuery = (typeof GuildQuery)[keyof typeof GuildQuery];

export const CurrentHistoricalType = {
  SESSION: "SESSION",
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
} as const;

export type CurrentHistoricalType =
  (typeof CurrentHistoricalType)[keyof typeof CurrentHistoricalType];

export const LastHistoricalType = {
  LAST_DAY: "LAST_DAY",
  LAST_WEEK: "LAST_WEEK",
  LAST_MONTH: "LAST_MONTH",
} as const;

export type LastHistoricalType = (typeof LastHistoricalType)[keyof typeof LastHistoricalType];

export const HistoricalTimes = { ...LastHistoricalType, ...CurrentHistoricalType };
export type HistoricalType = LastHistoricalType | CurrentHistoricalType;

export const CacheLevel = {
  CACHE: "CACHE",
  CACHE_ONLY: "CACHE_ONLY",
  LIVE: "LIVE",
} as const;

export type CacheLevel = (typeof CacheLevel)[keyof typeof CacheLevel];

export const LeaderboardQuery = {
  PAGE: "page",
  INPUT: "input",
  POSITION: "position",
} as const;

export type LeaderboardQuery = (typeof LeaderboardQuery)[keyof typeof LeaderboardQuery];
