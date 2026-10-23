/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { type ListGroup, withoutGroupPrefix } from "~/features/leaderboards/leaderboard-list";
import { cacheHeaders } from "~/lib/cache";
import { createHash } from "node:crypto";
import { plainText } from "~/components/ui/minecraft-text";
import { readNamespace } from "~/i18n/i18n.server";
import { rpcServerClient } from "./rpc.server";

interface BuiltList {
  groups: ListGroup[];
  json: string;
  /** The first 12 hex digits of the JSON's SHA-256, for its URL. */
  hash: string;
}

/** The list is schema metadata, so an hour is fresh enough, like `/leaderboards`' edge cache. */
const TTL_MS = 3_600_000;

let current: BuiltList | undefined;
let builtAt = 0;
let building: Promise<BuiltList> | undefined;

/** The list, built from the API's at most an hour ago. A failed rebuild keeps the last one while there is one. */
export async function leaderboardList(): Promise<BuiltList> {
  if (current && Date.now() - builtAt < TTL_MS) return current;

  building ??= build()
    .then((list) => {
      current = list;
      builtAt = Date.now();
      return list;
    })
    .finally(() => {
      building = undefined;
    });

  try {
    return await building;
  } catch (error) {
    if (current) return current;
    throw error;
  }
}

/** The list as last built, for the server's render of `/leaderboards`, whose loader has awaited it. */
export const builtLeaderboardList = (): ListGroup[] | undefined => current?.groups;

/**
 * Every leaderboard by game with its short name, plus the words the filter should also match where the name lacks
 * them: the English word the bot's cards use for the stat (the site's only locale) and the board's aliases.
 */
async function build(): Promise<BuiltList> {
  const [groups, defaults] = await Promise.all([rpcServerClient.leaderboard.list(), readNamespace(DEFAULT_LOCALE, "default")]);

  const word = (key: string) => {
    const text = key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], defaults);
    return typeof text === "string" && !text.includes("{{") ? text : undefined;
  };

  const named = groups.map((group) => ({ ...group, name: plainText(group.formatted) }));
  const list = withoutGroupPrefix(named).map(({ key, game, name, formatted, leaderboards }) => ({
    key,
    game,
    name,
    formatted,
    leaderboards: leaderboards.map(({ field, name: board, label, aliases }) => {
      const extra = [label && word(label), ...(aliases ?? [])].filter(
        (term): term is string => Boolean(term) && !board.toLowerCase().includes(term!.toLowerCase())
      );
      return { field, name: board, ...(extra.length > 0 && { terms: extra.join(" ") }) };
    }),
  }));

  const json = JSON.stringify(list);
  return { groups: list, json, hash: createHash("sha256").update(json).digest("hex").slice(0, 12) };
}

/**
 * `/leaderboards-<hash>.json`: the list, cached for good under its own hash. A page from before the list changed asks
 * for its old hash and gets today's list, cached for a minute only.
 */
export async function leaderboardListResponse(hash: string): Promise<Response> {
  const list = await leaderboardList();
  const cache =
    hash === list.hash ?
      { "Cache-Control": "public, max-age=31536000, immutable", "CDN-Cache-Control": "max-age=31536000" } :
      cacheHeaders("max-age=60");

  return new Response(list.json, { headers: { "Content-Type": "application/json; charset=utf-8", ...cache } });
}
