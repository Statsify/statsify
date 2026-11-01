/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AllLeaderboards } from "~/features/leaderboards/leaderboard-index";
import { PageBackground } from "~/components/ui/background";
import { MAX_QUERY_LENGTH, getLeaderboardIndex, listForClient } from "~/features/leaderboards/leaderboard-data";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { DEFAULT_LOCALE } from "~/i18n/locales";
import { createI18n } from "~/i18n/i18n";
import { localeData, socialMeta } from "~/lib/social-meta";
import { useTranslation } from "react-i18next";

/** The list is schema metadata: an hour fresh, a day stale. */
const EDGE_TTL_SECONDS = 3600;

/** `?q=`, the filter's query when it's submitted without scripts (the router parses `?q=123` to a number). */
const queryText = (raw: unknown) =>
  (typeof raw === "string" || typeof raw === "number" ? String(raw).trim().slice(0, MAX_QUERY_LENGTH) : "") || undefined;

/** A plain function, not a zod schema: every page's first load carries the routes' search parsing. */
const validateSearch = (search: Record<string, unknown>): { q?: string } => ({ q: queryText(search.q) });

export const Route = createFileRoute("/{-$locale}/leaderboards/")({
  validateSearch,
  loaderDeps: ({ search }) => ({ q: search.q }),
  // The page's data is the groups and the list's hash; the links are in the server's HTML.
  loader: async ({ deps }) => {
    const data = await getLeaderboardIndex({ data: { q: deps.q } });
    return { data, list: await listForClient(data.hash) };
  },
  staleTime: EDGE_TTL_SECONDS * 1000,
  head: ({ match, matches }) => {
    const locale = localeData(matches);
    // In English, from the server's `site.json`.
    const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
    const title = words.t("meta.leaderboards.title");
    const description = words.t("meta.leaderboards.description");
    const origin = locale?.origin;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(match.search.q ? [{ name: "robots", content: "noindex" }] : []),
        ...(origin ?
          socialMeta({
            origin,
            path: "/leaderboards",
            title,
            description,
            image: "/images/og-home.png",
            trail: { name: words.t("leaderboards.title") },
          }) :
          []),
      ],
    };
  },
  headers: () => cacheHeaders(`max-age=${EDGE_TTL_SECONDS}, stale-while-revalidate=86400`),
  component: LeaderboardsPage,
});

function LeaderboardsPage() {
  const { data, list } = Route.useLoaderData();
  const { q } = Route.useSearch();
  const { t } = useTranslation();

  return (
    <div className="relative grow">
      <PageBackground background="general" />
      <div className="w-container flex flex-col gap-6 px-4 py-12 text-mc-white md:px-8">
        <h1 className="text-center text-mc-2 lg:text-mc-3 font-bold">{t("leaderboards.title")}</h1>
        {/* A new `?q=` (back and forward) starts the filter over from it. */}
        <AllLeaderboards key={q ?? ""} data={data} list={list} query={q} />
      </div>
    </div>
  );
}
