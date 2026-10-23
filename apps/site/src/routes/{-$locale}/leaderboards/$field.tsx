/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background, backgroundFor, preloadBackground } from "~/components/ui/background";
import { FindPlayer, PageNav } from "~/features/leaderboards/leaderboard-table";
import { LeaderboardCards } from "~/features/leaderboards/leaderboard-cards";
import { LeaderboardIndex } from "~/features/leaderboards/leaderboard-index";
import { Link, createFileRoute } from "@tanstack/react-router";
import { NotFound } from "~/components/not-found";
import { cacheHeaders } from "~/lib/cache";
import { DEFAULT_LOCALE } from "~/i18n/locales";
import { createI18n } from "~/i18n/i18n";
import { formatNumber } from "~/i18n/format";
import { loadGlossaryWords } from "~/features/content/content-data";
import { isGameKey, loadLeaderboardGame, loadLeaderboardPage, type LeaderboardView } from "~/features/leaderboards/leaderboard-data";
import { SEARCH_DESCRIPTION_MAX, localeData, socialMeta, statsDescription, valueText } from "~/lib/social-meta";
import { plainText } from "~/components/ui/minecraft-text";
import { useTranslation } from "react-i18next";
import type { LeaderboardGame } from "@statsify/contract";
import type { GlossaryWords } from "~/i18n/i18n.server";
import type { QueryClient } from "@tanstack/react-query";

/**
 * A page from `?page=`, counted from 1 as the page shows it (a number or a string, depending on how it was typed);
 * garbage is the first page.
 */
const pageNumber = (raw: unknown) => {
  const page = Number(raw);
  return Number.isSafeInteger(page) && page > 1 ? page : undefined;
};

/**
 * A name or UUID from `?around=`; the router parses `?around=123` to a number, and anything longer than a dashed UUID
 * is cut.
 */
const aroundName = (raw: unknown) =>
  (typeof raw === "string" || typeof raw === "number" ? String(raw).trim().slice(0, 36) : "") || undefined;

/** `?mode=`, the mode a game's index opens at; a mode the game has no leaderboards under opens the first group. */
const modeKey = (raw: unknown) => (typeof raw === "string" && raw.length <= 32 ? raw : undefined);

/**
 * `?page=` is left out of URLs for the first page; `?around=<name or UUID>` anchors on a player. `?mode=` is a game
 * index's. A plain function, not a zod schema: every page's first load carries the routes' search parsing.
 */
const validateSearch = (
  search: Record<string, unknown>
): { page?: number; around?: string; mode?: string } => ({
  page: pageNumber(search.page),
  around: aroundName(search.around),
  mode: modeKey(search.mode),
});

/** What the board's stat is, from the glossary, with the key of its entry there. */
interface Explanation {
  key: string;
  text: string;
}

type RouteData = ({ kind: "board"; explanation?: Explanation } & LeaderboardView) | { kind: "game"; game: LeaderboardGame };

/** The board, with its stat's words: asked for beside it, not after it, since the browser fetches every stat's at once. */
async function loadBoard(
  queryClient: QueryClient,
  field: string,
  deps: { page: number; around?: string },
  words: Promise<GlossaryWords>
): Promise<RouteData> {
  const [view, glossary] = await Promise.all([loadLeaderboardPage(queryClient, field, deps), words]);
  const key = view.page.glossary;
  const text = key ? glossary[key]?.text : undefined;
  return { kind: "board", ...view, ...(key && text && { explanation: { key, text } }) };
}

/**
 * A leaderboard, or with a key that has no dot (`/leaderboards/bedwars`) the game's index of leaderboards by mode. The
 * index is schema metadata, cached as long as `/leaderboards`.
 */
export const Route = createFileRoute("/{-$locale}/leaderboards/$field")({
  validateSearch,
  // The API counts pages from 0. The mode only opens a group, so it isn't a dependency.
  loaderDeps: ({ search }) => ({ page: (search.page ?? 1) - 1, around: search.around }),
  loader: async ({ params, deps, context, parentMatchPromise }): Promise<RouteData> => {
    if (isGameKey(params.field)) {
      preloadBackground(backgroundFor(params.field));
      return { kind: "game", game: await loadLeaderboardGame(params.field) };
    }
    // The locale's words, by the hash in the layout's data.
    const words = parentMatchPromise.then(({ loaderData }) =>
      loadGlossaryWords({ queryClient: context.queryClient, locale: context.locale, hash: loaderData?.glossaryHash ?? "" }));
    return loadBoard(context.queryClient, params.field, deps, words);
  },
  staleTime: 60_000,
  head: ({ loaderData, match, matches }) => {
    const locale = localeData(matches);
    // Titles and descriptions in English, from the server's `site.json`.
    const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
    if (!loaderData) {
      const title = words.t("meta.notFound.leaderboard");
      return { meta: [{ title }, { property: "og:title", content: title }, { name: "twitter:title", content: title }] };
    }

    const origin = locale?.origin;
    const unfurl = (path: string, title: string, description: string) =>
      origin ? socialMeta({ origin, path, title, description, image: "/images/og-home.png" }) : [];

    if (loaderData.kind === "game") {
      const { name } = loaderData.game;
      const title = words.t("meta.leaderboard.gameTitle", { game: name });
      const description = words.t("meta.leaderboard.gameDescription", { game: name });

      return {
        meta: [
          { title },
          { name: "description", content: description },
          ...(match.search.mode ? [{ name: "robots", content: "noindex" }] : []),
          ...unfurl(`/leaderboards/${match.params.field}`, title, description),
        ],
      };
    }

    const { page } = loaderData;
    const title = words.t("meta.leaderboard.title", { name: page.name });
    const fallback = words.t("meta.leaderboard.description", { name: page.name });
    // A link preview shows the rows the link opens on: the player it's around, else the page's first three. A board
    // that hides its own stat (BedWars Level) shows it in the name, and its first column is another stat.
    const highlighted = page.rows.filter((row) => row.highlight);
    const ownValue = page.columns[0]?.field === page.field;
    const parts = (highlighted.length > 0 ? highlighted : page.rows.slice(0, 3)).map(
      (row) => `#${formatNumber(row.position, DEFAULT_LOCALE)} ${plainText(row.name)}${ownValue ? ` ${valueText(row.values[0])}` : ""}`
    );
    const rows = statsDescription(parts);
    const lead = words.t("meta.leaderboard.lead", { name: page.name });
    const description = statsDescription(parts, { lead, max: SEARCH_DESCRIPTION_MAX }) || fallback;
    const { page: number, around } = match.search;
    const query = new URLSearchParams({ ...(number && { page: String(number) }), ...(around && { around }) });

    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(loaderData.noindex ? [{ name: "robots", content: "noindex" }] : []),
        ...unfurl(`/leaderboards/${page.field}${query.size > 0 ? `?${query}` : ""}`, title, rows || fallback),
      ],
    };
  },
  headers: ({ loaderData }) =>
    cacheHeaders(loaderData?.kind === "game" ? "max-age=3600, stale-while-revalidate=86400" : "max-age=60, stale-while-revalidate=600"),
  // Its own boundary, so an unknown field 404s inside the layout rather than replacing it.
  notFoundComponent: BoardNotFound,
  component: LeaderboardRoute,
});

/** A field that's no board, with the way back to the list of them. */
function BoardNotFound() {
  const { t } = useTranslation();
  return <NotFound back={<Link to="/{-$locale}/leaderboards">{t("notFound.backBoards")}</Link>} />;
}

function LeaderboardRoute() {
  const data = Route.useLoaderData();
  return data.kind === "game" ? <GameIndexPage game={data.game} /> : <LeaderboardPage view={data} />;
}

/** A game's leaderboards by mode, opened at `?mode=` (the game page links here at its mode) or else the first group. */
function GameIndexPage({ game }: { game: LeaderboardGame }) {
  const { t } = useTranslation();
  const { mode } = Route.useSearch();
  const groups = game.modes.map(({ key, name, leaderboards }) => ({
    key,
    game: null,
    name: name ?? t("leaderboards.gameWide"),
    leaderboards,
  }));
  const open = groups.find(({ key }) => key === mode)?.key ?? groups[0]?.key;

  return (
    <div className="relative grow">
      <Background
        background={backgroundFor(game.key)}
        priority
        viewport
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-container flex flex-col gap-6 px-4 py-12 text-mc-white md:px-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-center text-mc-2 lg:text-mc-3 font-bold">{t("leaderboards.gameTitle", { game: game.name })}</h1>
          <Link to="/{-$locale}/leaderboards" className="inline-flex min-h-11 items-center text-mc-1.5 text-mc-yellow underline underline-offset-2">
            {t("leaderboards.all")}
          </Link>
        </div>
        <LeaderboardIndex groups={groups} open={open} />
      </div>
    </div>
  );
}

function LeaderboardPage({ view: { page, miss, explanation } }: { view: LeaderboardView & { explanation?: Explanation } }) {
  const { t } = useTranslation();
  const { field } = Route.useParams();

  return (
    <div className="relative grow">
      <Background
        background="general"
        priority
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 30%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-container flex flex-col gap-4 px-4 py-6 text-mc-white md:px-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-center text-mc-2 lg:text-mc-3 font-bold">{page.name}</h1>
          {/* The game's index, opened and scrolled to the board's mode. */}
          {page.index && (
            <Link
              to="/{-$locale}/leaderboards/$field"
              params={{ field: page.index.key }}
              search={{ mode: page.index.mode || undefined }}
              hash={page.index.mode || undefined}
              className="inline-flex min-h-11 items-center text-mc-1.5 text-mc-yellow underline underline-offset-2"
            >
              {t("leaderboards.gameTitle", { game: page.index.name })}
            </Link>
          )}
          {/* What the stat is: a line that wraps reads from the start, not centred. */}
          {explanation && (
            <p className="max-w-200 text-mc-1 text-mc-gray lg:text-mc-1.5">
              {explanation.text}{" "}
              <Link
                to="/{-$locale}/glossary"
                hash={explanation.key}
                className="relative text-mc-yellow underline underline-offset-2 after:absolute after:-inset-x-2 after:-inset-y-4 after:min-h-11 after:min-w-11"
              >
                {t("leaderboards.glossary")}
              </Link>
            </p>
          )}
        </div>
        <FindPlayer field={field} miss={miss} />
        <LeaderboardCards page={page} />
        <PageNav field={field} page={page.page} pages={page.pages} />
      </div>
    </div>
  );
}
