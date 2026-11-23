/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PlayerNotFound } from "~/features/player/player-not-found";
import { REDIRECT_HEADERS } from "~/lib/player-route";
import { SANS_PRELOAD } from "~/lib/fonts";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { missingPlayerResponse } from "~/lib/response";
import { resolvePlayer } from "~/features/player/resolve";

/** A player's pages, which resolve the URL's name or UUID here once for whichever page is below. */
export const Route = createFileRoute("/{-$locale}/player/$name")({
  beforeLoad: async ({ params }) => {
    const player = await resolvePlayer(params.name);

    if (!player) {
      missingPlayerResponse();
      throw notFound();
    }

    // UUIDs, old names and other casings all land on the current name, on the same page. A game page's key is lowered
    // here too, so an old name with an upper-case game redirects once.
    if (player.username !== params.name) {
      throw redirect({
        to: ".",
        params: ({ game, ...current }) => ({ ...current, name: player.username, ...(game && { game: game.toLowerCase() }) }),
        search: true,
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    return { player };
  },
  head: ({ match }) => (match.status === "notFound" ? { meta: [{ title: "Player Not Found | Statsify" }], links: [SANS_PRELOAD] } : {}),
  notFoundComponent: PlayerNotFound,
});
