/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { RATIOS, RATIO_STATS } from "#ratios";
import { prettify } from "@statsify/util";
import type {
  HistoricalMetadata,
  LeaderboardMetadata,
  TypeMetadata,
} from "../metadata.interface.js";
import type { HistoricalOptions, LeaderboardOptions } from "../field.options.js";

const getLeaderboardName = (field: string) => {
  const ratioIndex = RATIOS.indexOf(field);
  if (ratioIndex > -1) return RATIO_STATS[ratioIndex][3];
  if (field === "exp") return "EXP";
  return prettify(field);
};

const getDefaultLeaderboardLimit = (propertyKey: string) => {
  switch (propertyKey) {
    case "exp":
      return 1_000_000;

    case "wins":
    case "wlr":
    case "kills":
    case "kdr":
    case "finalKills":
    case "fkdr":
    case "bedsBroken":
    case "bblr":
      return 500_000;

    case "losses":
    case "deaths":
    case "finalDeaths":
    case "bedsLost":
    case "assists":
    case "coins":
    case "lootChests":
      return 100_000;

    default:
      return 50_000;
  }
};

export const getLeaderboardMetadata = (
  typeMetadata: TypeMetadata,
  propertyKey: string,
  leaderboardOptions?: LeaderboardOptions,
  historicalOptions?: HistoricalOptions
): { leaderboard: LeaderboardMetadata; historical: HistoricalMetadata } => {
  const fieldName = leaderboardOptions?.fieldName ?? getLeaderboardName(propertyKey);
  const name = leaderboardOptions?.name ?? fieldName;

  const historicalFieldName = historicalOptions?.fieldName ?? fieldName;
  const historicalName =
    historicalOptions?.name ?? leaderboardOptions?.name ?? historicalFieldName;

  let leaderboard: LeaderboardMetadata;
  let historical: LeaderboardMetadata;

  if (typeMetadata.type !== Number || typeMetadata.array) {
    leaderboard = {
      enabled: false,
      additionalFields: leaderboardOptions?.additionalFields || [],
      extraDisplay: leaderboardOptions?.extraDisplay,
      formatter: leaderboardOptions?.formatter,
      resetEvery: leaderboardOptions?.resetEvery,
      fieldName,
      name,
    };

    historical = { ...leaderboard, fieldName: historicalFieldName, name: historicalName };
  } else if (leaderboardOptions?.enabled === false) {
    leaderboard = {
      enabled: false,
      additionalFields: leaderboardOptions?.additionalFields || [],
      extraDisplay: leaderboardOptions?.extraDisplay,
      formatter: leaderboardOptions?.formatter,
      resetEvery: leaderboardOptions?.resetEvery,
      fieldName,
      name,
    };

    historical = {
      ...leaderboard,
      ...historicalOptions,
      fieldName: historicalFieldName,
      name: historicalName,
    };
  } else {
    leaderboard = {
      enabled: true,
      sort: leaderboardOptions?.sort || "DESC",
      fieldName,
      name,
      hidden: leaderboardOptions?.hidden,
      aliases: leaderboardOptions?.aliases || [],
      additionalFields: leaderboardOptions?.additionalFields || [],
      extraDisplay: leaderboardOptions?.extraDisplay,
      formatter: leaderboardOptions?.formatter,
      limit: leaderboardOptions?.limit ?? getDefaultLeaderboardLimit(propertyKey),
      resetEvery: leaderboardOptions?.resetEvery,
    };

    historical = {
      ...leaderboard,
      ...historicalOptions,
      fieldName: historicalFieldName,
      name: historicalName,
    };
  }

  return { leaderboard, historical };
};
