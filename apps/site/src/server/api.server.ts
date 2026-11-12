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

class ApiError extends Error {
  public constructor(public readonly status: number, path: string) {
    super(`Statsify API ${path} responded with ${status}`);
  }
}

async function api<T>(path: string, init: { method?: string; body?: string } = {}): Promise<T> {
  const { apiRoute, apiKey } = await siteConfig();

  const response = await fetch(new URL(path, apiRoute), {
    ...init,
    headers: { "x-api-key": apiKey, "content-type": "application/json" },
  });

  if (!response.ok) throw new ApiError(response.status, path);

  return response.json() as Promise<T>;
}

/** `CACHE_ONLY` still asks Hypixel for a player the API hasn't stored; `undefined` when Hypixel has none either. */
export async function getPlayer(tag: string): Promise<Json<Player> | undefined> {
  try {
    const { player } = await api<{ player?: Json<Player> }>(`/player?player=${encodeURIComponent(tag)}&cache=CACHE_ONLY`);
    return player;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export async function getGuild(memberUuid: string): Promise<Json<Guild>> {
  const { guild } = await api<{ guild?: Json<Guild> }>(`/guild?guild=${memberUuid}&type=PLAYER&cache=CACHE_ONLY`);
  if (!guild) throw new Error(`Guild of ${memberUuid} not found`);
  return guild;
}

export function getLeaderboard(field: string): Promise<PostLeaderboardResponse> {
  return api<PostLeaderboardResponse>("/player/leaderboards", {
    method: "POST",
    body: JSON.stringify({ field, page: 0 }),
  });
}

/** Username autocomplete from the API's RediSearch index; never touches Hypixel. */
export async function searchPlayers(query: string): Promise<string[]> {
  const { players } = await api<{ players?: string[] }>(`/player/search?query=${encodeURIComponent(query)}`);
  return players ?? [];
}
