/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

"use server";

import { env } from "~/app/env";
import type { Guild, Player } from "@statsify/schemas";
import type { PostLeaderboardResponse } from "@statsify/api-client";

export async function getPlayer(slug: string): Promise<Player | undefined> {
  const response = await fetch(`${env.API_URL}/player?${new URLSearchParams({ player: slug })}`, {
    headers: { "X-API-KEY": env.API_KEY },
  });

  if (response.status === 404) return;
  if (!response.ok) throw new Error(`Failed to get player: ${response.status}`);

  const body = await response.json();
  return body.player;
}

export async function getPlayerSuggestions(query: string): Promise<string[]> {
  const response = await fetch(`${env.API_URL}/player/search?${new URLSearchParams({ query })}`, {
    headers: { "X-API-KEY": env.API_KEY },
  });

  if (!response.ok) throw new Error(`Failed to search players: ${response.status}`);

  const body = await response.json();
  return body.players ?? [];
}

export async function getGuild(slug: string): Promise<Guild | undefined> {
  const response = await fetch(`${env.API_URL}/guild?${new URLSearchParams({ guild: slug, type: "PLAYER" })}`, {
    headers: { "X-API-KEY": env.API_KEY },
  });

  if (response.status === 404) return;
  if (!response.ok) throw new Error(`Failed to get guild: ${response.status}`);

  const { guild } = await response.json();
  return guild;
}

export async function getLeaderboard(field: string) {
  const response = await fetch(`${env.API_URL}/player/leaderboards`, {
    method: "POST",
    headers: { "X-API-KEY": env.API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      field,
      page: 0,
    }),
  });

  if (!response.ok) throw new Error(`Failed to get leaderboard: ${response.status}`);

  const body = await response.json();

  return body as PostLeaderboardResponse;
}

export async function getSkinRender(uuid: string): Promise<ArrayBuffer> {
  const response = await fetch(`${env.API_URL}/skin?${new URLSearchParams({ uuid })}`, {
    headers: { "X-API-KEY": env.API_KEY },
  });

  if (!response.ok) throw new Error(`Failed to get skin render: ${response.status}`);

  const body = await response.arrayBuffer();
  return body;
}
