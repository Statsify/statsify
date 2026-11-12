/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { CompareView, comparePairs } from "~/features/compare/compare-page";
import { EDGE_CACHE, REDIRECT_HEADERS, notFoundHead } from "~/lib/player-route";
import { LABEL_NAMESPACES, createI18n } from "~/i18n/i18n";
import { NotFound } from "~/components/not-found";
import { PlayerNotFoundView } from "~/features/player/player-not-found";
import { SEARCH_DESCRIPTION_MAX, localeData, socialMeta, statsDescription, valueText } from "~/lib/social-meta";
import { backgroundFor, preloadBackground } from "~/components/ui/background";
import { cacheHeaders } from "~/lib/cache";
import { cacheNotFoundResponse } from "~/lib/response";
import { createFileRoute, isNotFound, notFound, redirect } from "@tanstack/react-router";
import { ensurePlayer } from "~/features/player/resolve";
import { gamePageQuery, gameSearch, headingText, pageSearch } from "~/features/game/game-data";
import { orNull } from "~/lib/orpc";
import { plainText } from "~/components/ui/minecraft-text";
import { useSuspenseQuery } from "@tanstack/react-query";

/** Which not-found page to show: the player one for a name we don't know, else the plain 404 (a game or mode we lack). */
type Missing = { player?: string };

export const Route = createFileRoute("/{-$locale}/compare/$a/$b/$game")({
  validateSearch: gameSearch,
  loaderDeps: ({ search }) => ({ mode: search.mode, submode: search.submode, period: search.period }),
  loader: async ({ params, deps, context }) => {
    const [a, b] = await Promise.all([ensurePlayer(context.queryClient, params.a), ensurePlayer(context.queryClient, params.b)]);

    if (!a || !b) {
      cacheNotFoundResponse();
      throw notFound({ data: { player: a ? params.b : params.a } satisfies Missing });
    }

    // As on the game page, other names and casings land on the current names, and the game on its key.
    const game = params.game.toLowerCase();

    if (a.username !== params.a || b.username !== params.b || game !== params.game) {
      throw redirect({
        to: "/{-$locale}/compare/$a/$b/$game",
        params: { a: a.username, b: b.username, game },
        search: deps,
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    preloadBackground(backgroundFor(game));
    const load = (uuid: string) =>
      orNull(context.queryClient.ensureQueryData(gamePageQuery(uuid, game, deps.mode, deps.submode, deps.period)), ["NOT_FOUND", "BAD_REQUEST"]);
    const [first, second] = await Promise.all([load(a.uuid), load(b.uuid)]);

    if (!first || !second) {
      cacheNotFoundResponse();
      throw notFound({ data: {} satisfies Missing });
    }

    const { mode, submode, period } = pageSearch(first);

    if (deps.mode !== mode || deps.submode !== submode || deps.period !== period) {
      throw redirect({
        to: "/{-$locale}/compare/$a/$b/$game",
        params: { a: a.username, b: b.username, game },
        search: { mode, submode, period },
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    // For the unfurl's text: the first numbers of the headline table, as on the game page, else of the game-wide row.
    const groups = comparePairs(first, second);
    const table = groups.find(({ section }) => section?.title === null) ?? groups[0];
    const pairs = (table?.pairs ?? []).filter(({ a, b }) => !a.hidden && !b.hidden).slice(0, 4);

    return {
      a,
      b,
      game,
      mode,
      submode,
      period,
      heading: { game: first.game, heading: mode || submode ? first.heading : { ...first.heading, mode: null } },
      gameName: plainText(first.game.name),
      headline: pairs.map(({ a, b }) => ({ label: a.label, name: a.name, params: a.params, values: [a.value, b.value], suffix: a.suffix })),
    };
  },
  staleTime: 60_000,
  head: ({ loaderData, matches, match }) => {
    const locale = localeData(matches);
    const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
    if (!loaderData) {
      const missing = isNotFound(match.error) ? (match.error.data as Missing | undefined) : undefined;
      return notFoundHead(words.t(missing?.player === undefined ? "meta.notFound.page" : "meta.notFound.player"));
    }

    const { a, b, game, mode, submode, period, heading, gameName, headline } = loaderData;
    const card = plainText(headingText(heading, (key) => words.t(key))).replaceAll(/\s+/g, " ").trim();
    // As on the game page, the card names no period, so the title does.
    const when = period ? `${words.t(`game.periodNames.${period}`)} ` : "";
    const title = words.t("meta.compare.title", { a: a.username, b: b.username, page: `${when}${card}` });
    const label = (key: string, params?: Record<string, string>) => words.t(key, { ns: LABEL_NAMESPACES, ...params });
    const parts = headline.map(({ label: key, name, params, values, suffix = "" }) =>
      `${name === undefined ? label(key, params) : plainText(name)} ${values.map((value) => `${valueText(value)}${suffix}`).join(" / ")}`);
    const lead = words.t("meta.compare.lead", { a: a.username, b: b.username, game: gameName });
    const fallback = words.t("meta.compare.description", { a: a.username, b: b.username, game: gameName });
    const description = statsDescription(parts, { lead, max: SEARCH_DESCRIPTION_MAX }) || fallback;
    const query = new URLSearchParams({ ...(mode && { mode }), ...(submode && { submode }), ...(period && { period }) });
    const origin = locale?.origin;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        // Any two players make a page, so none is indexed.
        { name: "robots", content: "noindex" },
        ...(origin ?
          socialMeta({
            origin,
            path: `/compare/${a.username}/${b.username}/${game}${query.size > 0 ? `?${query}` : ""}`,
            title,
            description: statsDescription(parts) || fallback,
            image: "/images/og-home.png",
          }) :
          []),
      ],
    };
  },
  headers: () => cacheHeaders(EDGE_CACHE),
  notFoundComponent: ({ data }) => {
    const player = (data as Missing | undefined)?.player;
    return player === undefined ? <NotFound /> : <PlayerNotFoundView name={player} />;
  },
  component: ComparePage,
});

function ComparePage() {
  const { a, b, game } = Route.useLoaderData();
  const { mode, submode, period } = Route.useSearch();
  const { data: first } = useSuspenseQuery(gamePageQuery(a.uuid, game, mode, submode, period));
  const { data: second } = useSuspenseQuery(gamePageQuery(b.uuid, game, mode, submode, period));

  return <CompareView a={first} b={second} />;
}
