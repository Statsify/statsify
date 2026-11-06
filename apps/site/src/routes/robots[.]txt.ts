/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "~/server/config.server";

/**
 * Paged and "around" leaderboard variants carry `noindex` too; the sitemap index lists what may be
 * crawled (no player pages yet).
 */
const robots = (sitemap: string) => `User-agent: *
Disallow: /api/
Disallow: /_serverFn/
Disallow: /*?page=
Disallow: /*?*&page=
Disallow: /*?around=
Disallow: /*?*&around=

Sitemap: ${sitemap}
`;

/**
 * `site.indexable` off (a staging deploy): crawling stays open so crawlers see the `X-Robots-Tag: noindex` every
 * response carries (`start.ts`) and drop the pages. `Disallow: /` would hide that header, and URLs linked from
 * elsewhere could then be indexed without their content. No sitemap: they 404 here.
 */
const NOT_INDEXABLE = `User-agent: *
Disallow: /api/
Disallow: /_serverFn/
`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const { publicUrl, indexable } = await siteConfig();

        return new Response(indexable ? robots(`${publicUrl}/sitemap.xml`) : NOT_INDEXABLE, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
            "CDN-Cache-Control": "max-age=86400",
          },
        });
      },
    },
  },
});
