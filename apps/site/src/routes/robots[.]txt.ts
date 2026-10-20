/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createFileRoute } from "@tanstack/react-router";

// No sitemap: 2.45M player pages. Paged and "around" leaderboard variants carry noindex too.
const ROBOTS = `User-agent: *
Disallow: /api/
Disallow: /_serverFn/
Disallow: /*?page=
Disallow: /*?*&page=
Disallow: /*?around=
Disallow: /*?*&around=
`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(ROBOTS, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
            "CDN-Cache-Control": "max-age=86400",
          },
        }),
    },
  },
});
