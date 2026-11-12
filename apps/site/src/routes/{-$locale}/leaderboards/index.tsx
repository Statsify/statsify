/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Background } from "~/components/ui/background";
import { LeaderboardIndex, withoutGroupPrefix } from "~/features/leaderboards/leaderboard-index";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { rpc } from "~/lib/orpc";
import { useTranslation } from "react-i18next";

/** The list is schema metadata: an hour fresh, a day stale. */
const EDGE_TTL_SECONDS = 3600;

export const Route = createFileRoute("/{-$locale}/leaderboards/")({
  // The short names travel in the page's hydration data too, so they're cut down before it's serialized.
  loader: async () => withoutGroupPrefix(await rpc.leaderboard.list()),
  staleTime: EDGE_TTL_SECONDS * 1000,
  head: () => ({
    meta: [
      { title: "Leaderboards | Statsify" },
      { name: "description", content: "Browse more than 2,000 Hypixel leaderboards on Statsify." },
    ],
  }),
  headers: () => cacheHeaders(`max-age=${EDGE_TTL_SECONDS}, stale-while-revalidate=86400`),
  component: LeaderboardsPage,
});

function LeaderboardsPage() {
  const groups = Route.useLoaderData();
  const { t } = useTranslation();

  return (
    <div className="relative grow">
      <Background
        background="general"
        priority
        className="h-full"
        mask="linear-gradient(rgb(255 255 255) 20%, rgb(0 0 0 / 0) 95%)"
      />
      <div className="absolute h-full w-full bg-[rgb(17_17_17_/0.7)] -z-10" />
      <div className="w-container flex flex-col gap-6 px-4 py-12 text-mc-white md:px-8">
        <h1 className="text-center text-mc-2 lg:text-mc-3 font-bold">{t("leaderboards.title")}</h1>
        <LeaderboardIndex groups={groups} />
      </div>
    </div>
  );
}
