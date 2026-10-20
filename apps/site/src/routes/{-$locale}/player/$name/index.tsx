/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PlayerNotFound } from "~/features/player/player-not-found";
import { PlayerSkeleton } from "~/features/player/player-skeleton";
import { PlayerView } from "~/features/player/player-page";
import { cacheHeaders } from "~/lib/cache";
import { SANS_PRELOAD } from "~/lib/fonts";
import { cacheNotFoundResponse } from "~/lib/response";
import { createFileRoute, notFound, redirect, useParams } from "@tanstack/react-router";
import { playerPageQuery, resolvePlayer } from "~/features/player/resolve";
import { useSuspenseQuery } from "@tanstack/react-query";

/** Fresh for a minute, stale for ten, and served stale for a day if the API is down. */
const EDGE_CACHE = "max-age=60, stale-while-revalidate=600, stale-if-error=86400";

const possessive = (username: string) => `${username}'${username.endsWith("s") ? "" : "s"}`;

export const Route = createFileRoute("/{-$locale}/player/$name/")({
  loader: async ({ params, context }) => {
    const identity = await resolvePlayer(params.name);

    if (!identity) {
      // Five minutes at the edge. A lookup that finds the player navigates in the browser, so it never sees this page.
      cacheNotFoundResponse("max-age=300");
      throw notFound();
    }

    // UUIDs, old names and other casings all land on the current name. Names change hands, so
    // browsers and the edge keep the redirect for an hour rather than forever.
    if (identity.username !== params.name) {
      throw redirect({
        to: "/{-$locale}/player/$name",
        params: { name: identity.username },
        statusCode: 301,
        headers: { "Cache-Control": "public, max-age=3600", "CDN-Cache-Control": "max-age=3600" },
      });
    }

    await context.queryClient.ensureQueryData(playerPageQuery(identity.uuid));

    return identity;
  },
  staleTime: 60_000,
  head: ({ loaderData }) =>
    loaderData ?
      {
        meta: [
          { title: `${possessive(loaderData.username)} Hypixel Stats | Statsify` },
          { name: "description", content: `View ${possessive(loaderData.username)} Hypixel stats on Statsify.` },
        ],
        links: [SANS_PRELOAD, { rel: "icon", href: `/api/skin/head?uuid=${loaderData.uuid}&size=32` }],
      } :
      { meta: [{ title: "Player Not Found | Statsify" }], links: [SANS_PRELOAD] },
  headers: () => cacheHeaders(EDGE_CACHE),
  notFoundComponent: PlayerNotFound,
  pendingComponent: PlayerPending,
  component: PlayerPage,
});

function PlayerPage() {
  const { uuid } = Route.useLoaderData();
  const { data: page } = useSuspenseQuery(playerPageQuery(uuid));

  return <PlayerView page={page} />;
}

function PlayerPending() {
  const { name = "" } = useParams({ strict: false });
  return <PlayerSkeleton name={name} />;
}
