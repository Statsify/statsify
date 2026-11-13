/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIData } from "@statsify/util";
import { ColorSchema } from "../color.definition.js";
import { PlayerStatsSchema, playerStats } from "./stats.definition.js";
import { PlayerStatusSchema, playerStatus } from "./status.definition.js";
import { getDisplayName, getPlayerRank, getPlusColor, getRankColor } from "./util.js";
import { s } from "#definition/s";
import type { ColorId } from "../color.js";

const PlayerSocialsSchema = s.object({
  discord: s.string().optional(),
  forums: s.string().optional(),
  instagram: s.string().optional(),
  tiktok: s.string().optional(),
  twitch: s.string().optional(),
  twitter: s.string().optional(),
  youtube: s.string().optional(),
});

export type PlayerSocials = s.infer<typeof PlayerSocialsSchema>;

export const PlayerSchema = s.model("Player", {
  uuid: s.string().index({ unique: true }),
  username: s.string(),
  usernameToLower() {
    return s
      .string()
      .computed((username) => username?.toLowerCase(), [this.username])
      .index()
      .lowercase();
  },
  rank: s.string().default("DEFAULT"),
  rankPlusColor: s.string<ColorId>().optional(),
  plusColor() {
    return ColorSchema.computed(
      // Read back from Mongo, a missing plus color is "" rather than undefined
      (rank, rankPlusColor) => getPlusColor(rank, rankPlusColor || undefined),
      [this.rank, this.rankPlusColor]
    );
  },
  prefixName() {
    return s
      .string()
      .computed((rank, username) => `${getRankColor(rank).code}${username}`, [this.rank, this.username]);
  },
  displayName() {
    return s
      .string()
      .computed(getDisplayName, [this.username, this.rank, this.plusColor.code]);
  },
  socials: PlayerSocialsSchema,
  stats: PlayerStatsSchema,
  status: PlayerStatusSchema,
  expiresAt: s.number().leaderboard(false),
  sessionReset: s.number().optional().raw().leaderboard(false),
  cached: s.boolean().optional().store(false),
  isNew: s.boolean().optional().store(false),
  guildId: s.string().optional(),
});

export type Player = s.infer<typeof PlayerSchema>;

function socials(data: APIData = {}): s.input<typeof PlayerSocialsSchema> {
  return {
    discord: data.DISCORD,
    forums: data.HYPIXEL,
    instagram: data.INSTAGRAM,
    tiktok: data.TIKTOK,
    twitch: data.TWITCH,
    twitter: data.TWITTER,
    youtube: data.YOUTUBE,
  };
}

export function player(data: APIData = {}): s.input<typeof PlayerSchema> {
  return {
    uuid: data.uuid,
    username: data.displayname,
    rank: getPlayerRank(data),
    rankPlusColor: data.rankPlusColor,
    socials: socials(data.socialMedia?.links),
    stats: playerStats(data),
    status: playerStatus(data),
    // A service sets it when the player is saved
    expiresAt: 0,
  };
}
