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

async function previewPlayer(uuid: string) {
  const player = await getPlayer(uuid);
  if (!player) throw new Error(`Preview player ${uuid} is not in the database`);
  return player;
}

/** The fixed preview players, guild and leaderboard the home page sections render. */
export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const [bedwars, skywars, duels, arcade, session, guild, leaderboard] = await Promise.all([
    previewPlayer(BEDWARS_PREVIEW),
    previewPlayer(SKYWARS_PREVIEW),
    previewPlayer(DUELS_PREVIEW),
    previewPlayer(ARCADE_PREVIEW),
    previewPlayer(SESSION_PREVIEW),
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
