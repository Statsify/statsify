/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GroupSummary, type ListGroup, fetchLeaderboardList, filterGroups, gameKeysFor } from "./leaderboard-list";
import { REDIRECT_HEADERS } from "~/lib/player-route";
import { cacheNotFoundResponse } from "~/lib/response";
import { createServerFn } from "@tanstack/react-start";
import { leaderboardList } from "~/server/leaderboard-list.server";
import { notFound, redirect } from "@tanstack/react-router";
import { ensurePlayer } from "~/features/player/resolve";
import { orNull, rpc } from "~/lib/orpc";
import { z } from "zod";
import type { LeaderboardGame, LeaderboardPage } from "@statsify/contract";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { HistoryState } from "@tanstack/react-router";

export const PAGE_SIZE = 25;

/** The longest `?q=` on `/leaderboards`; anything past it is cut. */
export const MAX_QUERY_LENGTH = 64;

/**
 * What `/leaderboards` carries in its hydration data: each group without its leaderboards and the list's hash. With
 * `?q=`, also the groups with a match and how many. The links themselves are in the server's HTML, and the filter
 * fetches the list by its hash.
 */
export interface IndexData {
  groups: GroupSummary[];
  hash: string;
  matches?: GroupSummary[];
}

const summaries = (groups: ListGroup[]): GroupSummary[] =>
  groups.map(({ key, game, name, formatted, leaderboards }) => ({ key, game, name, formatted, count: leaderboards.length }));

export const getLeaderboardIndex = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.string().max(MAX_QUERY_LENGTH).optional() }))
  .handler(async ({ data }): Promise<IndexData> => {
    const list = await leaderboardList();
    const matches = data.q?.trim() ? { matches: summaries(filterGroups(list.groups, data.q)) } : {};
    return { groups: summaries(list.groups), hash: list.hash, ...matches };
  });

/**
 * The list for a client-side visit to `/leaderboards`, so its links and filter are ready at once; the server's render
 * has its own copy and leaves it out of the page's data. A failed fetch leaves it to the filter to try again.
 */
export const listForClient = (hash: string): Promise<ListGroup[] | undefined> =>
  import.meta.env.SSR ? Promise.resolve(undefined) : fetchLeaderboardList(hash).catch(() => undefined);

/** `/leaderboards/<key>` is a game's index rather than a leaderboard: every leaderboard's field has a dot. */
export const isGameKey = (field: string): boolean => !field.includes(".");

/** A game's index of leaderboards; an unknown game is a 404, cached like an unknown leaderboard. */
export async function loadLeaderboardGame(key: string): Promise<LeaderboardGame> {
  const game = key.length <= 32 ? await orNull(rpc.leaderboard.game({ key })) : null;
  if (game) return game;

  // Another case, or a short name the player URLs take too (`bw`, `tnt`), lands on the game's own key.
  const lower = key.toLowerCase();
  const aliases = [...new Set([lower, ...gameKeysFor(lower)])].filter((alias) => alias !== key && alias.length <= 32);
  const found = await Promise.all(aliases.map((alias) => orNull(rpc.leaderboard.game({ key: alias }))));
  const alias = aliases.find((_, index) => found[index]);
  if (alias) throw redirect({ to: "/{-$locale}/leaderboards/$field", params: { field: alias }, search: true, statusCode: 301, headers: REDIRECT_HEADERS });

  cacheNotFoundResponse();
  throw notFound();
}

interface PageQuery {
  field: string;
  page?: number;
  around?: string;
}

/**
 * Why `?around=` could not anchor the page: the name is unknown, the player has no entry, or they moved off the page
 * between the API finding their rank and reading it.
 */
export interface AroundMiss {
  kind: "unknown" | "unranked" | "moved";
  name: string;
}

export interface LeaderboardView {
  page: LeaderboardPage;
  miss?: AroundMiss;
  /** Paged and `around` variants are not indexed (robots.txt and `noindex`). */
  noindex: boolean;
}

export interface StreamState {
  key: string;
  field: string;
  around?: string;
  position?: number;
}

/** A page of a stream: its rows less the players a page loaded before it already shows. */
export interface StreamChunk {
  page: LeaderboardPage;
  /** How many rows the API sent: none ends the board, while a page of repeats doesn't. */
  sent: number;
  miss?: AroundMiss;
  /** The page the visit opened. */
  seed?: boolean;
}

export const streamKey = (field: string, key: string) => ["leaderboard-stream", field, key] as const;

/** A history entry's state as the router reads it: the site's own, and the entry's key. */
export type EntryState = HistoryState & { __TSR_key?: string };

/**
 * The stream of the visit a history entry is. An entry without one hasn't left the page it opened, so its URL is that
 * page's and its own key names the stream.
 */
export const streamOf = (
  state: EntryState,
  field: string,
  { around, position }: { around?: string; position?: number }
): StreamState =>
  state.leaderboardStream?.field === field
    ? state.leaderboardStream
    // eslint-disable-next-line no-underscore-dangle -- the history entry's key, under TanStack's name
    : { key: state.__TSR_key ?? "", field, around, position };

/** A page as the stream asks for it: no `around`, and the input in one order, so the edge caches one copy. */
export const fetchStreamPage = (field: string, page: number, signal?: AbortSignal) =>
  rpc.leaderboard.page({ field, page, size: PAGE_SIZE }, { signal });

/**
 * The page the URL names, from the visit's stream when it already holds it: following the stream by URL costs no
 * request.
 */
export function streamView(
  queryClient: QueryClient,
  field: string,
  state: EntryState,
  { page, around, position }: { page: number; around?: string; position?: number }
): LeaderboardView | undefined {
  const stream = streamOf(state, field, { around, position });
  const selector = around !== undefined || position !== undefined;
  if (selector && (around !== stream.around || position !== stream.position)) return;

  const chunks = queryClient.getQueryData<InfiniteData<StreamChunk, number>>(streamKey(field, stream.key))?.pages;
  const chunk = chunks?.find((chunk) => (selector ? chunk.seed : chunk.page.page === page));
  return chunk && { page: chunk.page, miss: chunk.miss, noindex: chunk.page.page > 0 || selector };
}

/**
 * The page to render for `/leaderboards/$field?page=&around=&position=`. `around=<name>` resolves the player
 * and asks the API for the page they are on; an unknown or unranked player falls back to the
 * requested page with a notice. `position=<n>` is the page holding that position, its row marked as a player's is. An
 * unknown leaderboard is a 404.
 */
export async function loadLeaderboardPage(
  queryClient: QueryClient,
  field: string,
  { page, around, position }: { page: number; around?: string; position?: number }
): Promise<LeaderboardView> {
  if (!around && position) {
    const held = await requireShownPage(field, Math.floor((position - 1) / PAGE_SIZE));
    return { page: { ...held, rows: held.rows.map((row) => ({ ...row, highlight: row.position === position })) }, noindex: true };
  }

  if (!around) return { page: await requireShownPage(field, page), noindex: page > 0 };

  const identity = await ensurePlayer(queryClient, around);
  if (!identity) return { page: await requireShownPage(field, page), miss: { kind: "unknown", name: around }, noindex: true };

  const anchored = await fetchPage({ field, around: identity.uuid });
  if (anchored) {
    // The API marks the rank it looked up, which can be someone else's by the time it reads the page.
    const rows = anchored.rows.map((row) => ({ ...row, highlight: row.uuid === identity.uuid }));
    const moved = !rows.some((row) => row.highlight);
    return { page: { ...anchored, rows }, ...(moved && { miss: { kind: "moved", name: identity.username } }), noindex: true };
  }

  return { page: await requireShownPage(field, page), miss: { kind: "unranked", name: identity.username }, noindex: true };
}

/**
 * The page, but past the last page goes to the last page, cached for a minute only, since the board can grow. The
 * redirect drops `around` and `position`, which led past the end too.
 */
async function requireShownPage(field: string, page: number): Promise<LeaderboardPage> {
  const shown = await requirePage({ field, page });
  if (shown.rows.length === 0 && shown.pages > 0 && page >= shown.pages) {
    throw redirect({
      to: ".",
      search: (prev) => ({ ...prev, page: shown.pages > 1 ? shown.pages : undefined, around: undefined, position: undefined }),
      statusCode: 301,
      headers: { "Cache-Control": "public, max-age=60", "CDN-Cache-Control": "max-age=60" },
    });
  }
  return shown;
}

async function requirePage(input: PageQuery): Promise<LeaderboardPage> {
  const page = await fetchPage(input);
  if (!page) {
    // Unknown leaderboards are cached like unknown players.
    cacheNotFoundResponse();
    throw notFound();
  }
  return page;
}

/**
 * `null` when the API answers `NOT_FOUND`: no such leaderboard, or the player is not on it. A page number the API
 * refuses (`BAD_REQUEST`, past 2^53) is no such page either, rather than an error page.
 */
async function fetchPage(input: PageQuery): Promise<LeaderboardPage | null> {
  return orNull(rpc.leaderboard.page({ ...input, size: PAGE_SIZE }), ["NOT_FOUND", "BAD_REQUEST"]);
}
