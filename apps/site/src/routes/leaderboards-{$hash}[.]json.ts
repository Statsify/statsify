/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createFileRoute } from "@tanstack/react-router";
import { leaderboardListResponse } from "~/server/leaderboard-list.server";

/** Every leaderboard, for `/leaderboards`' filter, which fetches it on first use rather than in the page's data. */
export const Route = createFileRoute("/leaderboards-{$hash}.json")({
  server: {
    handlers: {
      GET: ({ params }) => leaderboardListResponse(params.hash),
    },
  },
});
