/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { siteConfig } from "./config.server";
import type { Guild, Player } from "@statsify/schemas";
import type { Json } from "~/lib/json";
import type { PostLeaderboardResponse } from "@statsify/api-client";

/**
 * `CacheLevel.CACHE_ONLY`: the API answers from Mongo, but it still asks Hypixel for a player it has never
 * seen, with no site budget. The home page only asks for its fixed preview players.
 */
const CACHE_ONLY = "CACHE_ONLY";

async function api<T>(path: string, init: { method?: string; body?: string } = {}): Promise<T> {
  const { apiRoute, apiKey } = await siteConfig();

  const response = await fetch(new URL(path, apiRoute), {
    ...init,
    headers: { "x-api-key": apiKey, "content-type": "application/json" },
  });

  if (!response.ok) throw new Error(`Statsify API ${path} responded with ${response.status}`);

  return response.json() as Promise<T>;
}

export async function getPlayer(uuid: string): Promise<Json<Player>> {
  const { player } = await api<{ player?: Json<Player> }>(`/player?player=${uuid}&cache=${CACHE_ONLY}`);
  if (!player) throw new Error(`Player ${uuid} not found`);
  return player;
}

export async function getGuild(memberUuid: string): Promise<Json<Guild>> {
  const { guild } = await api<{ guild?: Json<Guild> }>(`/guild?guild=${memberUuid}&type=PLAYER&cache=${CACHE_ONLY}`);
  if (!guild) throw new Error(`Guild of ${memberUuid} not found`);
  return guild;
}

export function getLeaderboard(field: string): Promise<PostLeaderboardResponse> {
  return api<PostLeaderboardResponse>("/player/leaderboards", {
    method: "POST",
    body: JSON.stringify({ field, page: 0 }),
  });
}
