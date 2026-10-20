/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { UNFURL_POLICY, gameImageOf, playerImageResponse } from "~/server/images.server";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";

/**
 * The Discord unfurl image: the bot's general card for a player, by UUID, or with `?game=` (and `?mode=`) the card of
 * that game page. Never calls Hypixel.
 */
export const Route = createFileRoute("/og/{$uuid}.png")({
  server: {
    handlers: {
      GET: ({ params, request }) => {
        const game = gameImageOf(new URL(request.url).searchParams);
        if (game === null) return new Response(null, { status: 404, headers: cacheHeaders("max-age=300") });
        return playerImageResponse(request, params.uuid, "og", UNFURL_POLICY, game);
      },
    },
  },
});
