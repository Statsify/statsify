/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ORPCError } from "@orpc/client";
import { cacheNotFoundResponse } from "~/lib/response";
import { notFound, redirect } from "@tanstack/react-router";
import { resolvePlayer } from "~/features/player/resolve";
import { rpc } from "~/lib/orpc";
import type { LeaderboardGame, LeaderboardPage } from "@statsify/contract";

const PAGE_SIZE = 25;

/** `/leaderboards/<key>` is a game's index rather than a leaderboard: every leaderboard's field has a dot. */
export const isGameKey = (field: string): boolean => !field.includes(".");

/** A game's index of leaderboards; an unknown game is a 404, cached like an unknown leaderboard. */
export async function loadLeaderboardGame(key: string): Promise<LeaderboardGame> {
  try {
    if (key.length <= 32) return await rpc.leaderboard.game({ key });
  } catch (error) {
    if (!(error instanceof ORPCError && error.code === "NOT_FOUND")) throw error;
  }

  cacheNotFoundResponse("max-age=300");
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

/**
 * The page to render for `/leaderboards/$field?page=&around=`. `around=<name>` resolves the player
 * and asks the API for the page they are on; an unknown or unranked player falls back to the
 * requested page with a notice. An unknown leaderboard is a 404.
 */
export async function loadLeaderboardPage(field: string, { page, around }: { page: number; around?: string }): Promise<LeaderboardView> {
  if (!around) {
    const shown = await requirePage({ field, page });
    // Past the last page goes to the last page, cached for a minute only, since the board can grow.
    if (shown.rows.length === 0 && shown.pages > 0 && page >= shown.pages) {
      throw redirect({
        to: ".",
        search: (prev) => ({ ...prev, page: shown.pages > 1 ? shown.pages : undefined }),
        statusCode: 301,
        headers: { "Cache-Control": "public, max-age=60", "CDN-Cache-Control": "max-age=60" },
      });
    }
    return { page: shown, noindex: page > 0 };
  }

  const identity = await resolvePlayer(around);
  if (!identity) return { page: await requirePage({ field, page }), miss: { kind: "unknown", name: around }, noindex: true };

  const anchored = await fetchPage({ field, around: identity.uuid });
  if (anchored) {
    // The API marks the rank it looked up, which can be someone else's by the time it reads the page.
    const rows = anchored.rows.map((row) => ({ ...row, highlight: row.uuid === identity.uuid }));
    const moved = !rows.some((row) => row.highlight);
    return { page: { ...anchored, rows }, ...(moved && { miss: { kind: "moved", name: identity.username } }), noindex: true };
  }

  return { page: await requirePage({ field, page }), miss: { kind: "unranked", name: identity.username }, noindex: true };
}

async function requirePage(input: PageQuery): Promise<LeaderboardPage> {
  const page = await fetchPage(input);
  if (!page) {
    // Unknown leaderboards are cached like unknown players.
    cacheNotFoundResponse("max-age=300");
    throw notFound();
  }
  return page;
}

/**
 * `null` when the API answers `NOT_FOUND`: no such leaderboard, or the player is not on it. A page number the API
 * refuses (`BAD_REQUEST`, past 2^53) is no such page either, rather than an error page.
 */
async function fetchPage(input: PageQuery): Promise<LeaderboardPage | null> {
  try {
    return await rpc.leaderboard.page({ ...input, size: PAGE_SIZE });
  } catch (error) {
    if (error instanceof ORPCError && (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")) return null;
    throw error;
  }
}
