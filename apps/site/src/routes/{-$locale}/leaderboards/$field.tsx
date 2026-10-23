/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { FindPlayer, PageNav } from "~/features/leaderboards/leaderboard-table";
import { LeaderboardCards } from "~/features/leaderboards/leaderboard-cards";
import { NotFound } from "~/components/not-found";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { loadLeaderboardPage } from "~/features/leaderboards/leaderboard-data";
import { z } from "zod";

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

/** `?page=` is left out of URLs for the first page; `?around=<name or UUID>` anchors on a player. */
const SearchSchema = z.object({
  page: z.unknown().transform(pageNumber).optional(),
  around: z.unknown().transform(aroundName).optional(),
});

export const Route = createFileRoute("/{-$locale}/leaderboards/$field")({
  validateSearch: SearchSchema,
  // The API counts pages from 0.
  loaderDeps: ({ search }) => ({ page: (search.page ?? 1) - 1, around: search.around }),
  loader: ({ params, deps }) => loadLeaderboardPage(params.field, deps),
  staleTime: 60_000,
  head: ({ loaderData }) =>
    loaderData ?
      {
        meta: [
          { title: `${loaderData.page.name} Leaderboard | Statsify` },
          { name: "description", content: `The top Hypixel players by ${loaderData.page.name} on Statsify.` },
          ...(loaderData.noindex ? [{ name: "robots", content: "noindex" }] : []),
        ],
      } :
      { meta: [{ title: "Leaderboard Not Found | Statsify" }] },
  headers: () => cacheHeaders("max-age=60, stale-while-revalidate=600"),
  // Its own boundary, so an unknown field 404s inside the layout rather than replacing it.
  notFoundComponent: NotFound,
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { field } = Route.useParams();
  const { page, miss } = Route.useLoaderData();

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
        <h1 className="text-center text-mc-2 lg:text-mc-3 font-bold">{page.name}</h1>
        <FindPlayer field={field} miss={miss} />
        <LeaderboardCards page={page} />
        <PageNav field={field} page={page.page} pages={page.pages} />
      </div>
    </div>
  );
}
