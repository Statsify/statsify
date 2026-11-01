/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { EDGE_CACHE, REDIRECT_HEADERS, notFoundHead, possessive } from "~/lib/player-route";
import { GameView } from "~/features/game/game-page";
import { Link, createFileRoute, isNotFound, notFound, redirect } from "@tanstack/react-router";
import { NotFound } from "~/components/not-found";
import { PlayerNotFound } from "~/features/player/player-not-found";
import { SessionNotFound } from "~/features/session/session-not-found";
import { backgroundFor, preloadBackground } from "~/components/ui/background";
import { cacheHeaders } from "~/lib/cache";
import { cacheNotFoundResponse } from "~/lib/response";
import { createI18n } from "~/i18n/i18n";
import { ensurePlayer } from "~/features/player/resolve";
import { gameKeysFor } from "~/features/leaderboards/leaderboard-list";
import { headingText, modeSearch, submodeSearch } from "~/features/game/game-data";
import { localeData, socialMeta } from "~/lib/social-meta";
import { orNull } from "~/lib/orpc";
import { plainText } from "~/components/ui/minecraft-text";
import { playerTabIcon } from "~/lib/tab-icon";
import { sessionGameQuery, sessionPageQuery } from "~/features/session/session-data";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

/** A search parameter as typed, as on the game page; the API checks it. */
const param = (raw: unknown) => (typeof raw === "string" || typeof raw === "number" ? String(raw).slice(0, 32) || undefined : undefined);

const validateSearch = (search: Record<string, unknown>): { mode?: string; submode?: string } => ({
  mode: param(search.mode),
  submode: param(search.submode),
});

/** Which not-found page to show: the player one, the one for a player without a session, or the plain 404. */
type Missing = { missing: "player" | "session" | "game" };

export const Route = createFileRoute("/{-$locale}/player/$name/session/$game")({
  validateSearch,
  loaderDeps: ({ search }) => ({ mode: search.mode, submode: search.submode }),
  loader: async ({ params, deps, context }) => {
    const identity = await ensurePlayer(context.queryClient, params.name);

    if (!identity) {
      cacheNotFoundResponse();
      throw notFound({ data: { missing: "player" } satisfies Missing });
    }

    const game = params.game.toLowerCase();

    if (identity.username !== params.name || game !== params.game) {
      throw redirect({
        to: "/{-$locale}/player/$name/session/$game",
        params: { name: identity.username, game },
        search: { mode: deps.mode, submode: deps.submode },
        state: true,
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    // The player page's panels stand in for the bot's General.
    if (game === "general") {
      throw redirect({ to: "/{-$locale}/player/$name/session", params: { name: identity.username }, state: true, statusCode: 301, headers: REDIRECT_HEADERS });
    }

    preloadBackground(backgroundFor(game));
    const load = (key: string) =>
      orNull(context.queryClient.ensureQueryData(sessionGameQuery(identity.uuid, key, deps.mode, deps.submode)), ["NOT_FOUND", "BAD_REQUEST"]);
    const page = await load(game);

    if (!page) {
      // As on the game page, a short name (`bw`) lands on the game it stands for.
      const keys = gameKeysFor(game);
      const pages = await Promise.all(keys.map(load));
      const key = keys.find((_, index) => pages[index]);

      if (key) {
        throw redirect({
          to: "/{-$locale}/player/$name/session/$game",
          params: { name: identity.username, game: key },
          search: { mode: deps.mode, submode: deps.submode },
          state: true,
          statusCode: 301,
          headers: REDIRECT_HEADERS,
        });
      }

      // Both 404: tell a player without a session from a game or mode the site has no page for.
      const session = await orNull(context.queryClient.ensureQueryData(sessionPageQuery(identity.uuid)), ["NOT_FOUND"]);
      cacheNotFoundResponse();
      throw notFound({ data: { missing: session ? "game" : "session" } satisfies Missing });
    }

    const mode = modeSearch(page, page.mode);
    const submode = submodeSearch(page, page.submode);

    if (deps.mode !== mode || deps.submode !== submode) {
      throw redirect({
        to: "/{-$locale}/player/$name/session/$game",
        params: { name: identity.username, game },
        search: { mode, submode },
        state: true,
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    const titled = mode || submode ? page : { ...page, heading: { ...page.heading, mode: null } };

    return {
      ...identity,
      game,
      mode,
      submode,
      heading: { game: page.game, heading: titled.heading },
      gameName: plainText(page.game.name),
    };
  },
  staleTime: 60_000,
  staticData: { tabIcon: playerTabIcon },
  head: ({ loaderData, matches, match }) => {
    const locale = localeData(matches);
    const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
    if (!loaderData) {
      const missing = isNotFound(match.error) ? (match.error.data as Missing | undefined)?.missing : undefined;
      return notFoundHead(words.t(missing === "session" ? "meta.notFound.session" : missing === "game" ? "meta.notFound.page" : "meta.notFound.player"));
    }

    const { username, game, mode, submode, heading, gameName } = loaderData;
    const name = possessive(username);
    const card = plainText(headingText(heading, (key) => words.t(key))).replaceAll(/\s+/g, " ").trim();
    const title = words.t("meta.game.title", { name, page: card });
    const description = words.t("meta.session.gameDescription", { name, game: gameName });
    const query = new URLSearchParams({ ...(mode && { mode }), ...(submode && { submode }) });
    const origin = locale?.origin;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        // A session changes with every reset, so its pages aren't indexed.
        { name: "robots", content: "noindex" },
        ...(origin ?
          socialMeta({
            origin,
            path: `/player/${username}/session/${game}${query.size > 0 ? `?${query}` : ""}`,
            title,
            description,
            image: "/images/og-home.png",
            trail: {
              above: [{ name: username, path: `/player/${username}` }, { name: words.t("session.title"), path: `/player/${username}/session` }],
              name: gameName,
            },
          }) :
          []),
      ],
    };
  },
  headers: () => cacheHeaders(EDGE_CACHE),
  notFoundComponent: ({ data }) => {
    const missing = (data as Missing | undefined)?.missing;
    if (missing === "session") return <SessionNotFound />;
    return missing === "game" ? <GameNotFound /> : <PlayerNotFound />;
  },
  component: SessionGamePage,
});

/** A game or mode the site has no page for, with the way back to the session (the name is canonical by now). */
function GameNotFound() {
  const { t } = useTranslation();
  const { name } = Route.useParams();
  return <NotFound back={<Link to="/{-$locale}/player/$name/session" params={{ name }}>{t("session.back")}</Link>} />;
}

function SessionGamePage() {
  const { uuid, game } = Route.useLoaderData();
  const { mode, submode } = Route.useSearch();
  const { data: page } = useSuspenseQuery(sessionGameQuery(uuid, game, mode, submode));

  return <GameView page={page} />;
}
