/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Bingo } from "~/features/bingo/bingo";
import { BoardSearchSchema } from "~/features/bingo/board-search";
import { BingoLayout } from "~/features/bingo/bingo-layout";
import { BingoSkeleton } from "~/features/bingo/bingo-skeleton";
import { PlayerNotFound } from "~/features/bingo/player-not-found";
import { SANS_PRELOAD } from "~/lib/fonts";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { getBingoPlayer } from "~/features/bingo/bingo-data";

const EDGE_TTL_SECONDS = 300;

const possessive = (username: string) => `${username}'${username.endsWith("s") ? "" : "s"}`;

export const Route = createFileRoute("/{-$locale}/player/$name/bingo")({
  validateSearch: BoardSearchSchema,
  loader: async ({ params }) => {
    const player = await getBingoPlayer({ data: { name: params.name } });
    if (!player) throw notFound();
    return player;
  },
  staleTime: EDGE_TTL_SECONDS * 1000,
  head: ({ loaderData }) =>
    loaderData ?
      {
        meta: [
          { title: `${possessive(loaderData.username)} Bingo Stats | Statsify` },
          { name: "description", content: `View ${possessive(loaderData.username)} Hypixel 13th Anniversary Bingo Tasks.` },
        ],
        links: [SANS_PRELOAD, { rel: "icon", href: `/api/skin/head?uuid=${loaderData.uuid}&size=32` }],
      } :
      { meta: [{ title: "Player Not Found | Statsify" }], links: [SANS_PRELOAD] },
  headers: () => cacheHeaders(`max-age=${EDGE_TTL_SECONDS}, stale-while-revalidate=3600`),
  notFoundComponent: PlayerNotFound,
  pendingComponent: BingoPending,
  component: BingoPage,
});

function BingoPage() {
  const player = Route.useLoaderData();

  return (
    <BingoLayout name={player.username}>
      <Bingo player={player} />
    </BingoLayout>
  );
}

function BingoPending() {
  const { name = "" } = useParams({ strict: false });

  return (
    <BingoLayout name={name}>
      <BingoSkeleton />
    </BingoLayout>
  );
}
