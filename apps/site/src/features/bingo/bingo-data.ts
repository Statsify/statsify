/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ORPCError } from "@orpc/client";
import { rpc } from "~/lib/orpc";
import type { BingoPlayer } from "@statsify/contract";

/**
 * The boards for a username through the contract, strict cache-only: a page view never calls
 * Hypixel, and the refresh action is the only way to fetch the player again. `null` when the API has
 * never seen the name.
 */
export async function loadBingoPlayer(name: string): Promise<BingoPlayer | null> {
  try {
    const { uuid } = await rpc.player.resolve({ name });
    return await rpc.player.bingo({ uuid });
  } catch (error) {
    // A name the contract rejects (over 16 characters, say) can't be a player either.
    if (error instanceof ORPCError && (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")) return null;
    throw error;
  }
}
