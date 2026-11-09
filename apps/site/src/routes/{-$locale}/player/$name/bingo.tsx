/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Bingo } from "~/features/bingo/bingo";
import { validateBoardSearch } from "~/features/bingo/board-search";
import { loadBingoPlayer } from "~/features/bingo/bingo-data";
import { BingoLayout } from "~/features/bingo/bingo-layout";
import { PlayerNotFound } from "~/features/bingo/player-not-found";
import { RefreshBar } from "~/features/player/refresh-bar";
import { SANS_PRELOAD } from "~/lib/fonts";
import { playerTabIcon } from "~/lib/tab-icon";
import { cacheHeaders } from "~/lib/cache";
import { cacheNotFoundResponse } from "~/lib/response";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { localeData, socialMeta } from "~/lib/social-meta";
import { refreshBingo } from "~/features/player/player-actions";
import { useState } from "react";
import { DEFAULT_LOCALE } from "~/i18n/locales";
import { createI18n } from "~/i18n/i18n";
import type { BingoPlayer } from "@statsify/contract";

const EDGE_TTL_SECONDS = 300;

const possessive = (username: string) => `${username}'${username.endsWith("s") ? "" : "s"}`;

export const Route = createFileRoute("/{-$locale}/player/$name/bingo")({
  validateSearch: validateBoardSearch,
  loader: async ({ params, context }) => {
    const player = await loadBingoPlayer(context.queryClient, params.name);

    if (!player) {
      cacheNotFoundResponse("max-age=300");
      throw notFound();
    }

    return player;
  },
  staleTime: EDGE_TTL_SECONDS * 1000,
  staticData: { tabIcon: playerTabIcon },
  head: ({ loaderData, matches }) => {
    const locale = localeData(matches);
    // In English, from the server's `site.json`.
    const words = createI18n(DEFAULT_LOCALE, locale?.resources ?? {});
    if (!loaderData) return { meta: [{ title: words.t("meta.notFound.player") }], links: [SANS_PRELOAD] };

    const { username } = loaderData;
    const name = possessive(username);
    const title = words.t("meta.bingo.playerTitle", { name });
    const description = words.t("meta.bingo.playerDescription", { name });
    const origin = locale?.origin;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(origin ? socialMeta({ origin, path: `/player/${username}/bingo`, title, description, image: "/images/og-bingo.png" }) : []),
      ],
    };
  },
  headers: () => cacheHeaders(`max-age=${EDGE_TTL_SECONDS}, stale-while-revalidate=3600`),
  notFoundComponent: PlayerNotFound,
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

  const refresh = async (deadline: AbortSignal, auto: boolean, token: string | undefined) => {
    const result = await refreshBingo({ data: { uuid: player.uuid, auto, token }, signal: deadline });
    if (result.ok) setPlayer(result.data);
    return result;
  };

  return (
    <BingoLayout name={player.username}>
      <div className="w-full lg:w-[80%]">
        <RefreshBar updatedAt={player.updatedAt} expiresAt={player.expiresAt} refresh={refresh} auto />
      </div>
      <Bingo player={player} />
    </BingoLayout>
  );
}
