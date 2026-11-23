/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { IMAGE_VARIANTS } from "@statsify/profiles/protocol";
import { PlayerView } from "~/features/player/player-page";
import { cacheHeaders } from "~/lib/cache";
import { SANS_PRELOAD } from "~/lib/fonts";
import { possessive } from "~/lib/player-route";
import { createFileRoute } from "@tanstack/react-router";
import { localeData, socialMeta } from "~/lib/social-meta";
import { playerPageQuery } from "~/features/player/resolve";
import { useSuspenseQuery } from "@tanstack/react-query";

/** Fresh for a minute, stale for ten, and served stale for a day if the API is down. */
const EDGE_CACHE = "max-age=60, stale-while-revalidate=600, stale-if-error=86400";

export const Route = createFileRoute("/{-$locale}/player/$name/")({
  loader: async ({ context: { player, queryClient } }) => {
    const page = await queryClient.ensureQueryData(playerPageQuery(player.uuid));

    return { ...player, updatedAt: page.updatedAt };
  },
  staleTime: 60_000,
  head: ({ loaderData, matches }) => {
    if (!loaderData) return { links: [SANS_PRELOAD] };

    const { username, uuid, updatedAt } = loaderData;
    const title = `${possessive(username)} Hypixel Stats | Statsify`;
    const description = `View ${possessive(username)} Hypixel stats on Statsify.`;
    const origin = localeData(matches)?.origin;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        // `?v=` changes when the player is refreshed, so Discord fetches the new render.
        ...(origin ?
          socialMeta({
            origin,
            path: `/player/${username}`,
            title,
            description,
            image: `/og/${uuid}.png?v=${updatedAt}`,
            imageSize: IMAGE_VARIANTS.og,
            type: "profile",
          }) :
          []),
      ],
      links: [{ rel: "icon", href: `/api/skin/head?uuid=${uuid}&size=32` }],
    };
  },
  headers: () => cacheHeaders(EDGE_CACHE),
  component: PlayerPage,
});

function PlayerPage() {
  const { uuid } = Route.useLoaderData();
  const { data: page } = useSuspenseQuery(playerPageQuery(uuid));

  return <PlayerView page={page} />;
}
