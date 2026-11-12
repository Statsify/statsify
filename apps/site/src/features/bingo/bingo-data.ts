/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createServerFn } from "@tanstack/react-start";
import { getPlayer, searchPlayers } from "~/server/api.server";
import { z } from "zod";
import type { Bingo } from "@statsify/schemas";
import type { Json } from "~/lib/json";

/** Only what the boards need, so the page does not carry the whole player document. */
export interface BingoPlayer {
  uuid: string;
  username: string;
  displayName: string;
  bingo: Json<Bingo>;
}

const PlayerInput = z.object({ name: z.string().min(1).max(36) });

export const getBingoPlayer = createServerFn({ method: "GET" })
  .validator(PlayerInput)
  .handler(async ({ data }): Promise<BingoPlayer | null> => {
    const player = await getPlayer(data.name);
    if (!player) return null;

    return {
      uuid: player.uuid,
      username: player.username,
      displayName: player.displayName,
      bingo: player.stats.general.bingo,
    };
  });

const SearchInput = z.object({ query: z.string().trim().max(16) });

export const getPlayerSuggestions = createServerFn({ method: "GET" })
  .validator(SearchInput)
  .handler(({ data }) => (data.query ? searchPlayers(data.query) : Promise.resolve([])));
