/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { env } from "~/app/env";
import type { Guild, Player } from "@statsify/schemas";
import type { PostLeaderboardResponse } from "@statsify/api-client";

export async function getPlayer(slug: string): Promise<Player | undefined> {
  const response = await fetch(`${env.API_URL}/player?player=${slug}`, {
    headers: { "X-API-KEY": env.API_KEY },
  });

  const body = await response.json();
  return body.player;
}

export async function getGuild(slug: string): Promise<Guild> {
  const response = await fetch(`${env.API_URL}/guild?guild=${slug}&type=PLAYER`, {
    headers: { "X-API-KEY": env.API_KEY },

  });
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

  const body = await response.json();

  return body as PostLeaderboardResponse;
}
