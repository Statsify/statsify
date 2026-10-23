/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "~/i18n/locales";
import { SITE_NAME } from "~/lib/social-meta";
import { colors } from "@statsify/tokens";
import { createFileRoute } from "@tanstack/react-router";
import { createI18n } from "~/i18n/i18n";
import { loadResources } from "~/i18n/i18n.server";

/**
 * What a phone uses when the site is added to its home screen. `minimal-ui` keeps a back button: iOS's standalone
 * mode has none, and a page reached from a link would be a dead end. The maskable icon's logo fills the middle half of
 * the page's background, so every shape Android crops it to keeps all of it. The description is the pages' own, from
 * `site.json`.
 */
const manifest = (description: string) => JSON.stringify({
  name: SITE_NAME,
  short_name: SITE_NAME,
  description,
  start_url: "/",
  scope: "/",
  display: "minimal-ui",
  background_color: colors.blackify[950],
  theme_color: colors.blueify[500],
  icons: [
    { src: "/logos/logo_192.png", sizes: "192x192", type: "image/png" },
    { src: "/logos/logo_512.png", sizes: "512x512", type: "image/png" },
    { src: "/logos/logo_maskable_512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
});

export const Route = createFileRoute("/manifest.webmanifest")({
  server: {
    handlers: {
      GET: async () =>
        new Response(manifest(createI18n(DEFAULT_LOCALE, await loadResources(DEFAULT_LOCALE)).t("meta.description")), {
          headers: {
            "Content-Type": "application/manifest+json",
            "Cache-Control": "public, max-age=3600",
            "CDN-Cache-Control": "max-age=86400",
          },
        }),
    },
  },
});
