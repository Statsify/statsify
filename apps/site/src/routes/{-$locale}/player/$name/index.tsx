/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PlayerSkeleton } from "~/features/player/player-skeleton";
import { PlayerView } from "~/features/player/player-page";
import { cacheHeaders } from "~/lib/cache";
import { SANS_PRELOAD } from "~/lib/fonts";
import { possessive } from "~/lib/player-route";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { playerPageQuery } from "~/features/player/resolve";
import { useSuspenseQuery } from "@tanstack/react-query";

/** Fresh for a minute, stale for ten, and served stale for a day if the API is down. */
const EDGE_CACHE = "max-age=60, stale-while-revalidate=600, stale-if-error=86400";

export const Route = createFileRoute("/{-$locale}/player/$name/")({
  loader: async ({ context: { player, queryClient } }) => {
    await queryClient.ensureQueryData(playerPageQuery(player.uuid));
    return player;
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
      { links: [SANS_PRELOAD] },
  headers: () => cacheHeaders(EDGE_CACHE),
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
