/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SITE_NAME } from "~/lib/social-meta";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "~/server/config.server";

/**
 * oEmbed for the `<link rel="alternate" type="application/json+oembed">` every page carries; Discord
 * shows `provider_name` above the embed title. The answer is the same for every page, so a day at the edge.
 */
export const Route = createFileRoute("/oembed")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        if (!url.searchParams.get("url")) return new Response("url is required", { status: 400 });

        const { publicUrl } = await siteConfig();

        const body = {
          version: "1.0",
          type: "link",
          provider_name: SITE_NAME,
          provider_url: publicUrl,
        };

        return new Response(JSON.stringify(body), {
          headers: {
            "Content-Type": "application/json+oembed; charset=utf-8",
            ...cacheHeaders("max-age=86400"),
          },
        });
      },
    },
  },
});
