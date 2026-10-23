/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { IMAGE_VARIANTS } from "@statsify/profiles/protocol";
import { PlayerNotFound } from "~/features/player/player-not-found";
import { PlayerView } from "~/features/player/player-page";
import { cacheHeaders } from "~/lib/cache";
import { SANS_PRELOAD } from "~/lib/fonts";
import { cacheNotFoundResponse } from "~/lib/response";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { localeData, socialMeta } from "~/lib/social-meta";
import { ensurePlayer, playerPageQuery } from "~/features/player/resolve";
import { useSuspenseQuery } from "@tanstack/react-query";

/** Fresh for a minute, stale for ten, and served stale for a day if the API is down. */
const EDGE_CACHE = "max-age=60, stale-while-revalidate=600, stale-if-error=86400";

const possessive = (username: string) => `${username}'${username.endsWith("s") ? "" : "s"}`;

export const Route = createFileRoute("/{-$locale}/player/$name/")({
  loader: async ({ params, context }) => {
    const identity = await ensurePlayer(context.queryClient, params.name);

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

    const page = await context.queryClient.ensureQueryData(playerPageQuery(identity.uuid));

    return { ...identity, updatedAt: page.updatedAt };
  },
  staleTime: 60_000,
  head: ({ loaderData, matches }) => {
    if (!loaderData) return { meta: [{ title: "Player Not Found | Statsify" }], links: [SANS_PRELOAD] };

    const { username, uuid, updatedAt } = loaderData;
    const title = `${possessive(username)} Hypixel Stats | Statsify`;
    const description = `View ${possessive(username)} Hypixel stats on Statsify.`;
    const origin = localeData(matches)?.origin;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        // The Discord unfurl: the bot's general card at its UUID URL; `?v=` changes when the player is
        // refreshed, so Discord fetches the new render.
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
  notFoundComponent: PlayerNotFound,
  component: PlayerPage,
});

function PlayerPage() {
  const { uuid } = Route.useLoaderData();
  const { data: page } = useSuspenseQuery(playerPageQuery(uuid));

  return <PlayerView page={page} />;
}
