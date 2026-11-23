/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { UNFURL_POLICY, playerImageResponse } from "~/server/images.server";
import { createFileRoute } from "@tanstack/react-router";

/** The Discord unfurl image: the bot's general card for a player, by UUID. Never calls Hypixel. */
export const Route = createFileRoute("/og/{$uuid}.png")({
  server: {
    handlers: {
      GET: ({ params, request }) => playerImageResponse(request, params.uuid, "og", UNFURL_POLICY),
    },
  },
});
