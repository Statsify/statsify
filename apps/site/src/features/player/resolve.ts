/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ORPCError } from "@orpc/client";
import { UUID_PATTERN } from "~/lib/uuid";
import { orpc, rpc } from "~/lib/orpc";
import { type QueryClient, queryOptions } from "@tanstack/react-query";
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

/** How long a resolved name stays fresh in the query cache: the resolve's own edge TTL. */
const RESOLVE_STALE_MS = 60_000;

/** What the pages take from a resolve: who the URL's name or UUID is now. */
export type PlayerRef = Pick<PlayerIdentity, "uuid" | "username">;

/** A name or UUID's place in the query cache, in lower case as the API matches it. */
const resolveKey = (name: string) => ["player-resolve", name.toLowerCase()];

export const resolveQuery = (name: string) =>
  queryOptions({
    queryKey: resolveKey(name),
    queryFn: async ({ client }): Promise<PlayerRef | null> => {
      const identity = await resolvePlayer(name.toLowerCase());
      if (!identity) return null;

      const player = { uuid: identity.uuid, username: identity.username };
      // The answer by name is the answer by UUID too, and the other way round.
      client.setQueryData(resolveKey(UUID_PATTERN.test(name) ? player.username : player.uuid), player);
      return player;
    },
    staleTime: RESOLVE_STALE_MS,
  });

/**
 * `resolvePlayer` through the query cache, for loaders: a name or UUID resolved in the last minute, or a player the
 * site already showed (`rememberPlayer`), needs no request, so a tap on a player is one round trip, not two.
 */
export const ensurePlayer = (queryClient: QueryClient, name: string): Promise<PlayerRef | null> =>
  queryClient.fetchQuery(resolveQuery(name));

/** Keeps a player the page already has (a leaderboard row, a result card, a lookup) for `ensurePlayer`, by both keys. */
export function rememberPlayer(queryClient: QueryClient, { uuid, username }: PlayerRef) {
  for (const key of [uuid, username]) queryClient.setQueryData(resolveKey(key), { uuid, username });
}
