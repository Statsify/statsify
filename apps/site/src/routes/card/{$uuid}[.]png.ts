/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SIGNATURE_POLICY, playerImageResponse } from "~/server/images.server";
import { createFileRoute } from "@tanstack/react-router";

/** The general card at its native 808×540 with the "Updated" stamp, for Markdown and HTML embeds. */
export const Route = createFileRoute("/card/{$uuid}.png")({
  server: {
    handlers: {
      GET: ({ params, request }) => playerImageResponse(request, params.uuid, "card", SIGNATURE_POLICY),
    },
  },
});
