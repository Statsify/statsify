/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SIGNATURE_POLICY, playerImageResponse } from "~/server/images.server";
import { createFileRoute } from "@tanstack/react-router";

/**
 * The forum signature, 600×200, by UUID and nothing else: forums cache by URL, so there is no query
 * string or version to vary on, and the image carries its own "Updated" stamp.
 */
export const Route = createFileRoute("/sig/{$uuid}.png")({
  server: {
    handlers: {
      GET: ({ params, request }) => playerImageResponse(request, params.uuid, "sig", SIGNATURE_POLICY),
    },
  },
});
