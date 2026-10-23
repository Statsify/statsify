/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background, backgroundFor } from "~/components/ui/background";
import { FindPlayer, PageNav } from "~/features/leaderboards/leaderboard-table";
import { LeaderboardCards } from "~/features/leaderboards/leaderboard-cards";
import { LeaderboardIndex } from "~/features/leaderboards/leaderboard-index";
import { Link, createFileRoute } from "@tanstack/react-router";
import { NotFound } from "~/components/not-found";
import { cacheHeaders } from "~/lib/cache";
import { isGameKey, loadLeaderboardGame, loadLeaderboardPage, type LeaderboardView } from "~/features/leaderboards/leaderboard-data";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { LeaderboardGame } from "@statsify/contract";

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
 * index's.
 */
const SearchSchema = z.object({
  page: z.unknown().transform(pageNumber).optional(),
  around: z.unknown().transform(aroundName).optional(),
  mode: z.unknown().transform(modeKey).optional(),
});

type RouteData = ({ kind: "board" } & LeaderboardView) | { kind: "game"; game: LeaderboardGame };

/**
 * A leaderboard, or with a key that has no dot (`/leaderboards/bedwars`) the game's index of leaderboards by mode. The
 * index is schema metadata, cached as long as `/leaderboards`.
 */
export const Route = createFileRoute("/{-$locale}/leaderboards/$field")({
  validateSearch: SearchSchema,
  // The API counts pages from 0. The mode only opens a group, so it isn't a dependency.
  loaderDeps: ({ search }) => ({ page: (search.page ?? 1) - 1, around: search.around }),
  loader: async ({ params, deps }): Promise<RouteData> =>
    isGameKey(params.field) ?
      { kind: "game", game: await loadLeaderboardGame(params.field) } :
      { kind: "board", ...(await loadLeaderboardPage(params.field, deps)) },
  staleTime: 60_000,
  head: ({ loaderData, match }) => {
    if (!loaderData) return { meta: [{ title: "Leaderboard Not Found | Statsify" }] };

    if (loaderData.kind === "game") {
      const { name } = loaderData.game;
      return {
        meta: [
          { title: `${name} Leaderboards | Statsify` },
          { name: "description", content: `Every ${name} leaderboard on Statsify, by mode.` },
          ...(match.search.mode ? [{ name: "robots", content: "noindex" }] : []),
        ],
      };
    }

    return {
      meta: [
        { title: `${loaderData.page.name} Leaderboard | Statsify` },
        { name: "description", content: `The top Hypixel players by ${loaderData.page.name} on Statsify.` },
        ...(loaderData.noindex ? [{ name: "robots", content: "noindex" }] : []),
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

function LeaderboardPage({ view: { page, miss } }: { view: LeaderboardView }) {
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
          {/* Who is ranked, in what order and as of when. */}
          <p className="max-w-200 text-center text-mc-1 text-mc-gray">
            {t(page.sort === "ASC" ? "leaderboards.aboutLowest" : "leaderboards.aboutHighest")}
          </p>
        </div>
        <FindPlayer field={field} miss={miss} />
        <LeaderboardCards page={page} />
        <PageNav field={field} page={page.page} pages={page.pages} />
      </div>
    </div>
  );
}
