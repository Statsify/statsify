/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GameView } from "~/features/game/game-page";
import { imageSize, isGameCard } from "@statsify/profiles/protocol";
import { NotFound } from "~/components/not-found";
import { ORPCError } from "@orpc/client";
import { PlayerNotFound } from "~/features/player/player-not-found";
import { SANS_PRELOAD } from "~/lib/fonts";
import { cacheHeaders } from "~/lib/cache";
import { cacheNotFoundResponse } from "~/lib/response";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { gamePageQuery, modeSearch } from "~/features/game/game-data";
import { localeData, socialMeta } from "~/lib/social-meta";
import { plainText } from "~/components/ui/minecraft-text";
import { resolvePlayer } from "~/features/player/resolve";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";

/** As the player page: fresh for a minute, stale for ten, and served stale for a day if the API is down. */
const EDGE_CACHE = "max-age=60, stale-while-revalidate=600, stale-if-error=86400";
const REDIRECT_HEADERS = { "Cache-Control": "public, max-age=3600", "CDN-Cache-Control": "max-age=3600" };

const possessive = (username: string) => `${username}'${username.endsWith("s") ? "" : "s"}`;

/** `?mode=` as typed (the router reads `?mode=4v4` as a string and `?mode=123` as a number); the API checks it. */
const SearchSchema = z.object({
  mode: z
    .unknown()
    .transform((raw) => (typeof raw === "string" || typeof raw === "number" ? String(raw).slice(0, 32) || undefined : undefined))
    .optional(),
});

/** Which not-found page to show: the player one, with its lookup, or the plain 404 for a game or mode we don't have. */
type Missing = { player: boolean };

export const Route = createFileRoute("/{-$locale}/player/$name/$game")({
  validateSearch: SearchSchema,
  loaderDeps: ({ search }) => ({ mode: search.mode }),
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
        search: { mode: deps.mode },
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    const page = await context.queryClient.ensureQueryData(gamePageQuery(identity.uuid, game, deps.mode)).catch((error) => {
      // A game without a page, a mode it doesn't have, or a name too long to be either.
      if (error instanceof ORPCError && (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")) return null;
      throw error;
    });

    if (!page) {
      cacheNotFoundResponse("max-age=300");
      throw notFound({ data: { player: false } satisfies Missing });
    }

    // The first mode lives at the URL without `?mode=`.
    if (deps.mode !== undefined && modeSearch(page, deps.mode) === undefined) {
      throw redirect({
        to: "/{-$locale}/player/$name/$game",
        params: { name: identity.username, game },
        search: { mode: undefined },
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    const mode = page.modes.find(({ key }) => key === page.mode);

    return {
      ...identity,
      game,
      mode: modeSearch(page, page.mode),
      gameName: plainText(page.game.name),
      modeName: mode?.name ?? page.mode,
      updatedAt: page.updatedAt,
      // The unfurl's size: the game's card when the pool draws one for this mode, as `/og` picks it, else the general.
      unfurl: imageSize(isGameCard(page.game.key) ? { card: page.game.key, mode: page.mode } : { card: "general" }, "og"),
    };
  },
  staleTime: 60_000,
  head: ({ loaderData, matches }) => {
    if (!loaderData) return { meta: [{ title: "Not Found | Statsify" }], links: [SANS_PRELOAD] };

    const { username, uuid, updatedAt, game, mode, gameName, modeName, unfurl } = loaderData;
    const title = `${possessive(username)} ${gameName} Stats${mode ? ` (${modeName})` : ""} | Statsify`;
    const description = `View ${possessive(username)} Hypixel ${gameName}${mode ? ` ${modeName}` : ""} stats on Statsify.`;
    const origin = localeData(matches)?.origin;
    const path = `/player/${username}/${game}${mode ? `?${new URLSearchParams({ mode })}` : ""}`;

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
  const { mode } = Route.useSearch();
  const { data: page } = useSuspenseQuery(gamePageQuery(uuid, game, mode));

  return <GameView page={page} />;
}
