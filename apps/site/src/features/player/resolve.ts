/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ORPCError } from "@orpc/client";
import { orpc, rpc } from "~/lib/orpc";
import { UUID_PATTERN } from "~/lib/uuid";
import type { PlayerIdentity } from "@statsify/contract";

/** How long a loaded player page stays fresh in the query cache; matches the page's edge TTL. */
const PAGE_STALE_MS = 60_000;

/** Resolves a URL name or UUID to the stored identity, or `null` when the API has never seen it. */
export async function resolvePlayer(name: string): Promise<PlayerIdentity | null> {
  try {
    return await rpc.player.resolve(UUID_PATTERN.test(name) ? { uuid: name } : { name });
  } catch (error) {
    // A name the contract rejects (over 16 characters, say) can't be a player either.
    if (error instanceof ORPCError && (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")) return null;
    throw error;
  }
}

export const playerPageQuery = (uuid: string) => orpc.player.page.queryOptions({ input: { uuid }, staleTime: PAGE_STALE_MS });
