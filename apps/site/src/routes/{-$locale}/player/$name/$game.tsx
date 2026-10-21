/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { GameView, headingText } from "~/features/game/game-page";
import { imageSize, isGameCard } from "@statsify/profiles/protocol";
import { NotFound } from "~/components/not-found";
import { ORPCError } from "@orpc/client";
import { PlayerNotFound } from "~/features/player/player-not-found";
import { SANS_PRELOAD } from "~/lib/fonts";
import { cacheHeaders } from "~/lib/cache";
import { cacheNotFoundResponse } from "~/lib/response";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { createI18n } from "~/i18n/i18n";
import { gamePageQuery, modeSearch, submodeSearch } from "~/features/game/game-data";
import { localeData, socialMeta } from "~/lib/social-meta";
import { plainText } from "~/components/ui/minecraft-text";
import { resolvePlayer } from "~/features/player/resolve";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";

/** As the player page: fresh for a minute, stale for ten, and served stale for a day if the API is down. */
const EDGE_CACHE = "max-age=60, stale-while-revalidate=600, stale-if-error=86400";
const REDIRECT_HEADERS = { "Cache-Control": "public, max-age=3600", "CDN-Cache-Control": "max-age=3600" };

const possessive = (username: string) => `${username}'${username.endsWith("s") ? "" : "s"}`;

/** A search parameter as typed (the router reads `?mode=4v4` as a string and `?mode=123` as a number); the API checks it. */
const param = z
  .unknown()
  .transform((raw) => (typeof raw === "string" || typeof raw === "number" ? String(raw).slice(0, 32) || undefined : undefined))
  .optional();

const SearchSchema = z.object({ mode: param, submode: param });

/** Which not-found page to show: the player one, with its lookup, or the plain 404 for a game or mode we don't have. */
type Missing = { player: boolean };

export const Route = createFileRoute("/{-$locale}/player/$name/$game")({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => ({ mode: search.mode, submode: search.submode }),
  loader: async ({ params, deps, context }) => {
    const identity = await resolvePlayer(params.name);

    if (!identity) {
      cacheNotFoundResponse("max-age=300");
      throw notFound({ data: { player: true } satisfies Missing });
    }

    // As on the player page, UUIDs, old names and other casings land on the current name, and the game on its key.
    const game = params.game.toLowerCase();

    if (identity.username !== params.name || game !== params.game) {
      throw redirect({
        to: "/{-$locale}/player/$name/$game",
        params: { name: identity.username, game },
        search: { mode: deps.mode, submode: deps.submode },
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    const page = await context.queryClient.ensureQueryData(gamePageQuery(identity.uuid, game, deps.mode, deps.submode)).catch((error) => {
      // A game without a page, a mode or submode it doesn't have, or a name too long to be either.
      if (error instanceof ORPCError && (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")) return null;
      throw error;
    });

    if (!page) {
      cacheNotFoundResponse("max-age=300");
      throw notFound({ data: { player: false } satisfies Missing });
    }

    // The first mode lives at the URL without `?mode=`, and a mode's first submode without `&submode=`.
    const firstMode = deps.mode !== undefined && modeSearch(page, deps.mode) === undefined;
    const firstSubmode = deps.submode !== undefined && submodeSearch(page, deps.submode) === undefined;

    if (firstMode || firstSubmode) {
      throw redirect({
        to: "/{-$locale}/player/$name/$game",
        params: { name: identity.username, game },
        search: { mode: modeSearch(page, page.mode), submode: submodeSearch(page, page.submode) },
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    const mode = modeSearch(page, page.mode);
    const submode = submodeSearch(page, page.submode);
    // The card's title in plain text, without the mode on the game's first page.
    const titled = mode || submode ? page : { ...page, heading: { ...page.heading, mode: null } };

    return {
      ...identity,
      game,
      mode,
      submode,
      heading: { game: page.game, heading: titled.heading },
      gameName: plainText(page.game.name),
      modeName: titled.heading.mode ? plainText(titled.heading.mode) : undefined,
      updatedAt: page.updatedAt,
      // The unfurl's size: the game's card when the pool draws one for this mode, as `/og` picks it, else the general.
      unfurl: imageSize(isGameCard(page.game.key) ? { card: page.game.key, mode: page.mode } : { card: "general" }, "og"),
    };
  },
  staleTime: 60_000,
  head: ({ loaderData, matches }) => {
    if (!loaderData) {
      return { meta: [{ title: createI18n(DEFAULT_LOCALE, localeData(matches)?.resources ?? {}).t("meta.notFound.page") }], links: [SANS_PRELOAD] };
    }

    const { username, uuid, updatedAt, game, mode, submode, heading, gameName, modeName, unfurl } = loaderData;
    const locale = localeData(matches);
    // The card's title in plain text, its words (`game.stats`) in English like the rest, from the server's `site.json`.
    const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
    const card = plainText(headingText(heading, (key) => words.t(key))).replaceAll(/\s+/g, " ").trim();
    const title = `${possessive(username)} ${card} | Statsify`;
    const description = `View ${possessive(username)} Hypixel ${gameName}${modeName ? ` ${modeName}` : ""} stats on Statsify.`;
    const origin = locale?.origin;
    const query = new URLSearchParams({ ...(mode && { mode }), ...(submode && { submode }) });
    const path = `/player/${username}/${game}${query.size > 0 ? `?${query}` : ""}`;

    // The unfurl: the bot's card for this game and mode (`/og` falls back to the general card for a game without one).
    const image = `/og/${uuid}.png?${new URLSearchParams({ game, ...(mode && { mode }), v: String(updatedAt) })}`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(origin ? socialMeta({ origin, path, title, description, image, imageSize: unfurl, type: "profile" }) : []),
      ],
      links: [{ rel: "icon", href: `/api/skin/head?uuid=${uuid}&size=32` }],
    };
  },
  headers: () => cacheHeaders(EDGE_CACHE),
  notFoundComponent: ({ data }) => ((data as Missing | undefined)?.player === false ? <NotFound /> : <PlayerNotFound />),
  component: GamePage,
});

function GamePage() {
  const { uuid, game } = Route.useLoaderData();
  const { mode, submode } = Route.useSearch();
  const { data: page } = useSuspenseQuery(gamePageQuery(uuid, game, mode, submode));

  return <GameView page={page} />;
}
