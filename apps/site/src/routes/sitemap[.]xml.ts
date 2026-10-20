/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createFileRoute } from "@tanstack/react-router";
import { sitemapResponse } from "~/server/sitemap.server";

/** The sitemap index robots.txt points at: one child per list in `SITEMAPS`. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => sitemapResponse(),
    },
  },
});
