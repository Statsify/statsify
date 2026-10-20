/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ARCADE_PREVIEW,
  BEDWARS_PREVIEW,
  DUELS_PREVIEW,
  GUILD_MEMBER_PREVIEW,
  LEADERBOARD_PREVIEW,
  SESSION_PREVIEW,
  SKYWARS_PREVIEW,
} from "./preview-constants";
import { createServerFn } from "@tanstack/react-start";
import { getGuild, getLeaderboard, getPlayer } from "~/server/api.server";

/** The fixed preview players, guild and leaderboard the home page sections render. */
export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const [bedwars, skywars, duels, arcade, session, guild, leaderboard] = await Promise.all([
    getPlayer(BEDWARS_PREVIEW),
    getPlayer(SKYWARS_PREVIEW),
    getPlayer(DUELS_PREVIEW),
    getPlayer(ARCADE_PREVIEW),
    getPlayer(SESSION_PREVIEW),
    getGuild(GUILD_MEMBER_PREVIEW),
    getLeaderboard(LEADERBOARD_PREVIEW),
  ]);

  return {
    players: [bedwars, skywars, duels, arcade] as const,
    sessionPlayer: session,
    guild,
    leaderboard,
  };
});

export type HomeData = Awaited<ReturnType<typeof getHomeData>>;
