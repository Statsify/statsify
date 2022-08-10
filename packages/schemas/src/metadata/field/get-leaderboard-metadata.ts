/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LeaderboardMetadata, TypeMetadata } from "../metadata.interface";
import { LeaderboardOptions } from "../field.options";
import { RATIOS, RATIO_STATS } from "../../ratios";
import { prettify } from "@statsify/util";

const getLeaderboardName = (field: string) => {
  const ratioIndex = RATIOS.indexOf(field);
  if (ratioIndex > -1) return RATIO_STATS[ratioIndex][3];
  return prettify(field);
};

const getDefaultLeaderboardLimit = (propertyKey: string) => {
  switch (propertyKey) {
    case "exp":
      return 500_000;
    case "wins":
    case "wlr":
    case "kills":
    case "kdr":
    case "finalKills":
    case "fkdr":
    case "bedsBroken":
    case "bblr":
      return 100_000;
    case "losses":
    case "deaths":
    case "finalDeaths":
    case "bedsLost":
    case "assists":
    case "coins":
    case "lootChests":
      return 50_000;
    default:
      return 10_000;
  }
};

export const getLeaderboardMetadata = (
  typeMetadata: TypeMetadata,
  propertyKey: string,
  leaderboardOptions?: LeaderboardOptions
): LeaderboardMetadata => {
  const fieldName = leaderboardOptions?.fieldName ?? getLeaderboardName(propertyKey);
  const name = leaderboardOptions?.name ?? fieldName;

  if (typeMetadata.type !== Number || leaderboardOptions?.enabled === false) {
    return {
      enabled: false,
      additionalFields: leaderboardOptions?.additionalFields || [],
      extraDisplay: leaderboardOptions?.extraDisplay,
      formatter: leaderboardOptions?.formatter,
      fieldName,
      name,
    };
  }

  return {
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
};
