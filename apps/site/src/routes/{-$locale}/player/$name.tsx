/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { PlayerNotFound } from "~/features/player/player-not-found";
import { REDIRECT_HEADERS, notFoundHead } from "~/lib/player-route";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { createI18n } from "~/i18n/i18n";
import { ensurePlayer } from "~/features/player/resolve";
import { localeData } from "~/lib/social-meta";
import { missingPlayerResponse } from "~/lib/response";

/** A player's pages, which resolve the URL's name or UUID here once for whichever page is below. */
export const Route = createFileRoute("/{-$locale}/player/$name")({
  beforeLoad: async ({ params, context }) => {
    const player = await ensurePlayer(context.queryClient, params.name);

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
        // A search's history state goes along, so a typed name in another casing still updates as a bot command would.
        state: true,
        statusCode: 301,
        headers: REDIRECT_HEADERS,
      });
    }

    return { player };
  },
  head: ({ match, matches }) =>
    match.status === "notFound" ? notFoundHead(createI18n(DEFAULT_LOCALE, localeData(matches)?.resources ?? {}).t("meta.notFound.player")) : {},
  notFoundComponent: PlayerNotFound,
});
