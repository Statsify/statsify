/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { type ListGroup, withoutGroupPrefix } from "~/features/leaderboards/leaderboard-list";
import { IMMUTABLE_HEADERS, cacheHeaders } from "~/lib/cache";
import { createHash } from "node:crypto";
import { readNamespace } from "~/i18n/i18n.server";
import { rpcServerClient } from "./rpc.server";

interface BuiltList {
  groups: ListGroup[];
  json: string;
  /** The first 12 hex digits of the JSON's SHA-256, for its URL. */
  hash: string;
}

let current: BuiltList | undefined;
let building: Promise<BuiltList> | undefined;

/**
 * The list, built from the API's once: it's schema metadata, which changes only with a deploy. A failed build is
 * tried again on the next call.
 */
export function leaderboardList(): Promise<BuiltList> {
  building ??= build().then(
    (list) => {
      current = list;
      return list;
    },
    (error: unknown) => {
      building = undefined;
      throw error;
    }
  );

  return building;
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

  const list = withoutGroupPrefix(groups).map(({ key, game, name, leaderboards }) => ({
    key,
    game,
    name,
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
  const cache = hash === list.hash ? IMMUTABLE_HEADERS : cacheHeaders("max-age=60");
  return new Response(list.json, { headers: { "Content-Type": "application/json; charset=utf-8", ...cache } });
}
