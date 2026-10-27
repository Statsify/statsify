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
import { imageSize, pageCard } from "@statsify/profiles/protocol";
import { NotFound } from "~/components/not-found";
import { PlayerNotFound } from "~/features/player/player-not-found";
import { EDGE_CACHE, REDIRECT_HEADERS, notFoundHead, possessive } from "~/lib/player-route";
import { orNull } from "~/lib/orpc";
import { cacheHeaders } from "~/lib/cache";
import { cacheNotFoundResponse } from "~/lib/response";
import { Link, createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { LABEL_NAMESPACES, createI18n } from "~/i18n/i18n";
import { formatNumber } from "~/i18n/format";
import { gameKeysFor } from "~/features/leaderboards/leaderboard-list";
import { gamePageQuery, headingText, modeSearch, periodSearch, submodeSearch } from "~/features/game/game-data";
import { SEARCH_DESCRIPTION_MAX, localeData, socialMeta, statText, statsDescription } from "~/lib/social-meta";
import { plainText } from "~/components/ui/minecraft-text";
import { playerTabIcon } from "~/lib/tab-icon";
import { ensurePlayer } from "~/features/player/resolve";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

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
      cacheNotFoundResponse();
      throw notFound({ data: { player: true } satisfies Missing });
    }

    // As on the player page, UUIDs, old names and other casings land on the current name, and the game on its key.
    const game = params.game.toLowerCase();

    if (identity.username !== params.name || game !== params.game) {
      throw redirect({
        to: "/{-$locale}/player/$name/$game",
        params: { name: identity.username, game },
        search: { mode: deps.mode, submode: deps.submode, period: deps.period },
        // A search's history state goes along, as on the player page; so do the redirects below.
        state: true,
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    // The bot's General is the player page itself.
    if (game === "general") {
      throw redirect({ to: "/{-$locale}/player/$name", params: { name: identity.username }, state: true, statusCode: 301, headers: REDIRECT_HEADERS });
    }

    preloadBackground(backgroundFor(game));
    const load = (key: string) =>
      // A game without a page, a mode or submode it doesn't have, or a name too long to be either.
      orNull(context.queryClient.ensureQueryData(gamePageQuery(identity.uuid, key, deps.mode, deps.submode, deps.period)), ["NOT_FOUND", "BAD_REQUEST"]);
    const page = await load(game);

    if (!page) {
      // The short names the bot's users type (`/player/anrie/bw`) land on the game they stand for, where it has a page.
      // The site has no list of game keys, so only a name that 404s is tried as one.
      const keys = gameKeysFor(game);
      const pages = await Promise.all(keys.map(load));
      const key = keys.find((_, index) => pages[index]);

      if (key) {
        throw redirect({
          to: "/{-$locale}/player/$name/$game",
          params: { name: identity.username, game: key },
          search: { mode: deps.mode, submode: deps.submode, period: deps.period },
          state: true,
          statusCode: 301,
          headers: REDIRECT_HEADERS,
        });
      }

      cacheNotFoundResponse();
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
        state: true,
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    const mode = modeSearch(page, page.mode);
    const submode = submodeSearch(page, page.submode);
    const period = periodSearch(page, page.period);
    // The card's title in plain text, without the mode on the game's first page.
    const titled = mode || submode ? page : { ...page, heading: { ...page.heading, mode: null } };
    // For the unfurl's text: the level and the first numbers of the headline table, or of the game-wide row on a page
    // that has none (a list of maps, a period's quests).
    const table = page.sections.find((section) => section.title === null && !section.list && !section.ticks);
    const cells = (table?.rows.flat() ?? page.overview).filter((cell) => !cell.inline).slice(0, 6);

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
      unfurl: imageSize(pageCard(page), "og"),
      headline: {
        level: page.level && { label: page.level.label, value: page.level.current },
        cells: cells.map(({ label, name, params, value, hidden, suffix, of }) => ({ label, name, params, value, hidden, suffix, of })),
      },
    };
  },
  staleTime: 60_000,
  staticData: { tabIcon: playerTabIcon },
  head: ({ loaderData, matches }) => {
    if (!loaderData) return notFoundHead(createI18n(DEFAULT_LOCALE, localeData(matches)?.resources ?? {}).t("meta.notFound.page"));

    const { username, uuid, updatedAt, game, mode, submode, period, heading, gameName, modeName, unfurl, headline } = loaderData;
    const locale = localeData(matches);
    // The card's title in plain text, its words (`game.stats`) in English like the rest, from the server's `site.json`.
    const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
    const card = plainText(headingText(heading, (key) => words.t(key))).replaceAll(/\s+/g, " ").trim();
    // The card names no period (the switcher does), so the title does: "Daily Quests (SkyWars)".
    const when = period ? `${words.t(`game.periodNames.${period}`)} ` : "";
    const name = possessive(username);
    const gameTitle = words.t("meta.game.title", { name, page: `${when}${card}` });
    // The game's own level or prefix first, as its card formats it: "[223✫] anrie's BedWars Stats". Not a title (Duels'
    // "Bridge Legend III"), which reads as part of the name.
    const level = headline.level?.label === "stats.title" ? undefined : headline.level?.value;
    const title = level ? words.t("meta.levelFirst", { level: plainText(level), title: gameTitle }) : gameTitle;
    const gameAndMode = `${gameName}${modeName ? ` ${modeName}` : ""}`;
    const fallback = words.t("meta.game.description", { name, game: gameAndMode });
    const origin = locale?.origin;
    const query = new URLSearchParams({ ...(mode && { mode }), ...(submode && { submode }), ...(period && { period }) });
    const path = `/player/${username}/${game}${query.size > 0 ? `?${query}` : ""}`;

    // The unfurl: the bot's card for this game, mode, submode and period (`/og` falls back to the general card for a game
    // without one).
    const unfurlQuery = new URLSearchParams({ game, ...(mode && { mode }), ...(submode && { submode }), ...(period && { period }), v: String(updatedAt) });
    const image = `/og/${uuid}.png?${unfurlQuery}`;

    // A link preview without the card still shows the numbers: the stats' labels as the page shows them, in English.
    const label = (key: string, params?: Record<string, string>) => words.t(key, { ns: LABEL_NAMESPACES, ...params });
    const parts = [
      ...(headline.level ? [statText(label(headline.level.label), headline.level.value)] : []),
      ...headline.cells.map((cell) =>
        statText(
          cell.name === undefined ? label(cell.label, cell.params) : plainText(cell.name),
          cell.hidden ? words.t("default:stats.hidden") : cell.value,
          `${cell.suffix ?? ""}${cell.of === undefined ? "" : `/${formatNumber(cell.of, DEFAULT_LOCALE)}`}`
        )
      ),
    ];
    const stats = statsDescription(parts);
    const lead = words.t("meta.game.lead", { name, game: gameAndMode });
    const description = statsDescription(parts, { lead, max: SEARCH_DESCRIPTION_MAX }) || fallback;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(origin ?
          socialMeta({
            origin,
            path,
            title,
            description: stats || fallback,
            image,
            imageSize: unfurl,
            type: "profile",
            // The game alone, whatever the mode or period.
            trail: { above: [{ name: username, path: `/player/${username}` }], name: gameName },
          }) :
          []),
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
