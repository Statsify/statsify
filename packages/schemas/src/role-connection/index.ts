/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { getLevel } from "../player/gamemodes/bedwars/util.js";
import { getNetworkExp } from "../player/gamemodes/general/util.js";
import type { Player } from "../player/index.js";

// Discord's ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual
const INTEGER_GREATER_THAN_OR_EQUAL = 2;

// Ordered so Discord's "at least" check reads as "this rank or higher"
const RANK_TIERS = [
  ["None", ["DEFAULT"]],
  ["VIP", ["VIP"]],
  ["VIP+", ["VIP+"]],
  ["MVP", ["MVP"]],
  ["MVP+", ["MVP+"]],
  ["MVP++", ["MVP++", "bMVP++"]],
  ["YouTube", ["YOUTUBE"]],
  ["Staff", ["HELPER", "MOD", "GM", "ADMIN", "OWNER", "STAFF"]],
] as const;

const RANK_TIER = new Map<string, number>(
  RANK_TIERS.flatMap(([, ranks], tier) => ranks.map((rank) => [rank, tier] as const))
);

// Discord allows 5 records per app, shared by every server
export const ROLE_CONNECTION_METADATA = [
  {
    key: "network_level",
    name: "Network Level",
    description: "Hypixel network level",
    type: INTEGER_GREATER_THAN_OR_EQUAL,
    value: ({ stats: { general } }: Player) => {
      // networkLevel is rounded to 2 decimals, so 249.996 is stored as 250
      const level = Math.floor(general.networkLevel);
      return getNetworkExp(level) > general.networkExp ? level - 1 : level;
    },
  },
  {
    key: "bedwars_stars",
    name: "BedWars Stars",
    description: "BedWars stars on Hypixel",
    type: INTEGER_GREATER_THAN_OR_EQUAL,
    // From exp, since a deserialized level is rounded to 2 decimals
    value: (player: Player) => Math.floor(getLevel(player.stats.bedwars.exp)),
  },
  {
    key: "hypixel_rank",
    name: "Hypixel Rank",
    description: `Rank by number: ${RANK_TIERS.map(([name], tier) => `${tier} ${name}`).join(", ")}`,
    type: INTEGER_GREATER_THAN_OR_EQUAL,
    // Other ranks are one-off prefixes like PIG+++, which don't place on the ladder
    value: (player: Player) => RANK_TIER.get(player.rank),
  },
] as const;

export const getRoleConnectionMetadata = (player: Player) =>
  Object.fromEntries(
    ROLE_CONNECTION_METADATA.flatMap(({ key, value }) => {
      const result = value(player);
      return result === undefined ? [] : [[key, `${result}`]];
    })
  );

export class RoleConnection {
  @Field({ mongo: { index: true, unique: true } })
  public id: string;

  @Field({ mongo: { index: true } })
  public uuid: string;

  @Field()
  public accessToken: string;

  @Field()
  public refreshToken: string;

  @Field()
  public expiresAt: number;

  @Field()
  public pushedAt: number;
}
