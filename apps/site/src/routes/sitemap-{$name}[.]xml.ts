/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createFileRoute } from "@tanstack/react-router";
import { sitemapResponse } from "~/server/sitemap.server";

/** `/sitemap-static.xml` and `/sitemap-leaderboards.xml`, the children of the index. */
export const Route = createFileRoute("/sitemap-{$name}.xml")({
  server: {
    handlers: {
      GET: ({ params }) => sitemapResponse(params.name),
    },
  },
});
