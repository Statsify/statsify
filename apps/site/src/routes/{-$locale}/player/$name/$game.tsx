/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { backgroundFor, preloadBackground } from "~/components/ui/background";
import { GameView } from "~/features/game/game-page";
import { imageSize, isGameCard } from "@statsify/profiles/protocol";
import { NotFound } from "~/components/not-found";
import { ORPCError } from "@orpc/client";
import { PlayerNotFound } from "~/features/player/player-not-found";
import { SANS_PRELOAD } from "~/lib/fonts";
import { cacheHeaders } from "~/lib/cache";
import { cacheNotFoundResponse } from "~/lib/response";
import { Link, createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { createI18n } from "~/i18n/i18n";
import { gamePageQuery, headingText, modeSearch, periodSearch, submodeSearch } from "~/features/game/game-data";
import { localeData, socialMeta } from "~/lib/social-meta";
import { plainText } from "~/components/ui/minecraft-text";
import { playerTabIcon } from "~/lib/tab-icon";
import { ensurePlayer } from "~/features/player/resolve";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

/** As the player page: fresh for a minute, stale for ten, and served stale for a day if the API is down. */
const EDGE_CACHE = "max-age=60, stale-while-revalidate=600, stale-if-error=86400";
const REDIRECT_HEADERS = { "Cache-Control": "public, max-age=3600", "CDN-Cache-Control": "max-age=3600" };

const possessive = (username: string) => `${username}'${username.endsWith("s") ? "" : "s"}`;

/** A search parameter as typed (the router reads `?mode=4v4` as a string and `?mode=123` as a number); the API checks it. */
const param = (raw: unknown) => (typeof raw === "string" || typeof raw === "number" ? String(raw).slice(0, 32) || undefined : undefined);

/** A plain function, not a zod schema: every page's first load carries the routes' search parsing. */
const validateSearch = (search: Record<string, unknown>): { mode?: string; submode?: string; period?: string } => ({
  mode: param(search.mode),
  submode: param(search.submode),
  period: param(search.period),
});

/** Which not-found page to show: the player one, with its lookup, or the plain 404 for a game or mode we don't have. */
type Missing = { player: boolean };

export const Route = createFileRoute("/{-$locale}/player/$name/$game")({
  validateSearch,
  loaderDeps: ({ search }) => ({ mode: search.mode, submode: search.submode, period: search.period }),
  loader: async ({ params, deps, context }) => {
    const identity = await ensurePlayer(context.queryClient, params.name);

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
        search: { mode: deps.mode, submode: deps.submode, period: deps.period },
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    preloadBackground(backgroundFor(game));
    const page = await context.queryClient.ensureQueryData(gamePageQuery(identity.uuid, game, deps.mode, deps.submode, deps.period)).catch((error) => {
      // A game without a page, a mode or submode it doesn't have, or a name too long to be either.
      if (error instanceof ORPCError && (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")) return null;
      throw error;
    });

    if (!page) {
      cacheNotFoundResponse("max-age=300");
      throw notFound({ data: { player: false } satisfies Missing });
    }

    // The first mode lives at the URL without `?mode=`, and a mode's first submode without `&submode=`. So does its
    // first period, and one the mode doesn't have (Monthly, kept from another mode) lands there too. A key in another
    // case (`?mode=SOLO`) lands on the page's own.
    const canonical = deps.mode === modeSearch(page, page.mode) &&
      deps.submode === submodeSearch(page, page.submode) &&
      deps.period === periodSearch(page, page.period);

    if (!canonical) {
      throw redirect({
        to: "/{-$locale}/player/$name/$game",
        params: { name: identity.username, game },
        search: { mode: modeSearch(page, page.mode), submode: submodeSearch(page, page.submode), period: periodSearch(page, page.period) },
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    const mode = modeSearch(page, page.mode);
    const submode = submodeSearch(page, page.submode);
    const period = periodSearch(page, page.period);
    // The card's title in plain text, without the mode on the game's first page.
    const titled = mode || submode ? page : { ...page, heading: { ...page.heading, mode: null } };

    return {
      ...identity,
      game,
      mode,
      submode,
      period,
      heading: { game: page.game, heading: titled.heading },
      gameName: plainText(page.game.name),
      modeName: titled.heading.mode ? plainText(titled.heading.mode) : undefined,
      updatedAt: page.updatedAt,
      // The unfurl's size: the game's card when the pool draws one for this mode (and period), as `/og` picks it, else the
      // general.
      unfurl: imageSize(isGameCard(page.game.key, page.mode, page.period) ? { card: page.game.key, mode: page.mode } : { card: "general" }, "og"),
    };
  },
  staleTime: 60_000,
  staticData: { tabIcon: playerTabIcon },
  head: ({ loaderData, matches }) => {
    if (!loaderData) {
      return { meta: [{ title: createI18n(DEFAULT_LOCALE, localeData(matches)?.resources ?? {}).t("meta.notFound.page") }], links: [SANS_PRELOAD] };
    }

    const { username, uuid, updatedAt, game, mode, submode, period, heading, gameName, modeName, unfurl } = loaderData;
    const locale = localeData(matches);
    // The card's title in plain text, its words (`game.stats`) in English like the rest, from the server's `site.json`.
    const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
    const card = plainText(headingText(heading, (key) => words.t(key))).replaceAll(/\s+/g, " ").trim();
    // The card names no period (the switcher does), so the title does: "Daily Quests (SkyWars)".
    const when = period ? `${words.t(`game.periodNames.${period}`)} ` : "";
    const title = `${possessive(username)} ${when}${card} | Statsify`;
    const description = `View ${possessive(username)} Hypixel ${gameName}${modeName ? ` ${modeName}` : ""} stats on Statsify.`;
    const origin = locale?.origin;
    const query = new URLSearchParams({ ...(mode && { mode }), ...(submode && { submode }), ...(period && { period }) });
    const path = `/player/${username}/${game}${query.size > 0 ? `?${query}` : ""}`;

    // The unfurl: the bot's card for this game, mode, submode and period (`/og` falls back to the general card for a game
    // without one).
    const unfurlQuery = new URLSearchParams({ game, ...(mode && { mode }), ...(submode && { submode }), ...(period && { period }), v: String(updatedAt) });
    const image = `/og/${uuid}.png?${unfurlQuery}`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(origin ? socialMeta({ origin, path, title, description, image, imageSize: unfurl, type: "profile" }) : []),
      ],
    };
  },
  headers: () => cacheHeaders(EDGE_CACHE),
  notFoundComponent: ({ data }) => ((data as Missing | undefined)?.player === false ? <GameNotFound /> : <PlayerNotFound />),
  component: GamePage,
});

/** A game or mode the player has no page for, with the way back to their profile (the name is canonical by now). */
function GameNotFound() {
  const { t } = useTranslation();
  const { name } = Route.useParams();
  return <NotFound back={<Link to="/{-$locale}/player/$name" params={{ name }}>{t("notFound.backProfile", { name })}</Link>} />;
}

function GamePage() {
  const { uuid, game } = Route.useLoaderData();
  const { mode, submode, period } = Route.useSearch();
  const { data: page } = useSuspenseQuery(gamePageQuery(uuid, game, mode, submode, period));

  return <GameView page={page} />;
}
