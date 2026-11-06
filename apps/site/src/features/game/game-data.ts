/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PAGE_STALE_MS } from "~/lib/player-route";
import { orpc } from "~/lib/orpc";
import type { GamePage } from "@statsify/contract";

export type { GamePage };

/**
 * One page of a player's game: a mode, or a mode's submode, in one of its periods. Each is left out when it is the
 * first, as in the URL.
 */
export const gamePageQuery = (uuid: string, game: string, mode?: string, submode?: string, period?: string) =>
  orpc.player.game.queryOptions({ input: { uuid, game, mode, submode, period }, staleTime: PAGE_STALE_MS });

/** A search parameter as typed (the router reads `?mode=4v4` as a string and `?mode=123` as a number); the API checks it. */
export const searchParam = (raw: unknown) =>
  (typeof raw === "string" || typeof raw === "number" ? String(raw).slice(0, 32) || undefined : undefined);

/** A game page's search. A plain function, not a zod schema: every page's first load carries the routes' search parsing. */
export const gameSearch = (search: Record<string, unknown>): { mode?: string; submode?: string; period?: string } => ({
  mode: searchParam(search.mode),
  submode: searchParam(search.submode),
  period: searchParam(search.period),
});

/** Where a game page's links go, its game nav's and mode switcher's: the player's own pages, their session's, or a comparison. */
export type GameScope = { kind: "player" | "session"; name: string } | { kind: "compare"; a: string; b: string };

/** The route and params of a game's page in a scope; the mode, submode and period go in its search. */
export function gameLink(scope: GameScope, game: string) {
  if (scope.kind === "compare") return { to: "/{-$locale}/compare/$a/$b/$game", params: { a: scope.a, b: scope.b, game } } as const;
  const to = scope.kind === "session" ? "/{-$locale}/player/$name/session/$game" : "/{-$locale}/player/$name/$game";
  return { to, params: { name: scope.name, game } } as const;
}

/** The `?mode=` of a page: none for the game's first mode. */
export const modeSearch = (page: Pick<GamePage, "modes">, mode: string): string | undefined =>
  mode === page.modes[0]?.key ? undefined : mode;

/** The `&submode=` of a page: none for a mode's first submode, or a mode without any. */
export const submodeSearch = (page: Pick<GamePage, "submodes">, submode: string | null): string | undefined =>
  submode === null || submode === page.submodes[0]?.key ? undefined : submode;

/** The `&period=` of a page: none for its first period (all time), or a page without periods. */
export const periodSearch = (page: Pick<GamePage, "periods">, period: string | undefined): string | undefined =>
  period === undefined || period === page.periods?.[0] ? undefined : period;

/** The search of the page shown: its mode, submode and period, each left out when it is the first. */
export const pageSearch = (page: GamePage) => ({
  mode: modeSearch(page, page.mode),
  submode: submodeSearch(page, page.submode),
  period: periodSearch(page, page.period),
});

/**
 * The card's title: the game, the word after it ("Stats") and the mode as the card names it. It lives here, not with
 * the game view, because the route's `head()` uses it, and every page's first load carries what `head()` imports.
 */
export function headingText(page: Pick<GamePage, "game" | "heading">, word: (key: string) => string): string {
  const { name } = page.game;
  const { word: key, mode } = page.heading;
  return `§l${name}${key ? ` §f${word(key)}` : ""}${mode ? ` §r(${mode}§r)` : ""}`;
}
