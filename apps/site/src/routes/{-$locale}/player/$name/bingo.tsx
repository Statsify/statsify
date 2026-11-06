/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Bingo } from "~/features/bingo/bingo";
import { BoardSearchSchema } from "~/features/bingo/board-search";
import { loadBingoPlayer } from "~/features/bingo/bingo-data";
import { BingoLayout } from "~/features/bingo/bingo-layout";
import { BingoSkeleton } from "~/features/bingo/bingo-skeleton";
import { PlayerNotFound } from "~/features/bingo/player-not-found";
import { RefreshBar } from "~/features/player/refresh-bar";
import { SANS_PRELOAD } from "~/lib/fonts";
import { cacheHeaders } from "~/lib/cache";
import { cacheNotFoundResponse } from "~/lib/response";
import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { refreshBingo } from "~/features/player/player-actions";
import { useState } from "react";
import type { BingoPlayer } from "@statsify/contract";

const EDGE_TTL_SECONDS = 300;

const possessive = (username: string) => `${username}'${username.endsWith("s") ? "" : "s"}`;

export const Route = createFileRoute("/{-$locale}/player/$name/bingo")({
  validateSearch: BoardSearchSchema,
  loader: async ({ params }) => {
    const player = await loadBingoPlayer(params.name);

    if (!player) {
      cacheNotFoundResponse("max-age=300");
      throw notFound();
    }

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
  // Fresh loader data (another player, or a revalidation) resets the refreshed copy below.
  return <BingoBoards key={`${player.uuid}:${player.updatedAt}`} initial={player} />;
}

/** The boards plus the refresh bar; a refresh swaps in the boards the action hands back. */
function BingoBoards({ initial }: { initial: BingoPlayer }) {
  const [player, setPlayer] = useState(initial);

  const refresh = async () => {
    const result = await refreshBingo({ data: { uuid: player.uuid } });
    if (result.ok) setPlayer(result.data);
    return result;
  };

  return (
    <BingoLayout name={player.username}>
      <div className="w-[80%]">
        <RefreshBar updatedAt={player.updatedAt} expiresAt={player.expiresAt} refresh={refresh} />
      </div>
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
