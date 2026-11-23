/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createFileRoute } from "@tanstack/react-router";
import { proxySkin } from "~/server/skin.server";

/** The skin's texture, which the player page's skin viewer draws in 3D. */
export const Route = createFileRoute("/api/skin/texture")({
  server: {
    handlers: {
      GET: ({ request }) => proxySkin("/skin/texture", new URL(request.url).searchParams),
    },
  },
});
