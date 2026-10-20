/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PoolBusyError } from "@statsify/profiles/pool";
import { SkinUnavailableError, renderPlayerImage } from "~/server/images.server";
import { cacheHeaders } from "~/lib/cache";
import { createFileRoute } from "@tanstack/react-router";

/** The URLs carry an undashed UUID, the way the pages' `og:image` tags are written. */
const UUID = /^[\da-f]{32}$/;

/** Longer than the page: the page's `og:image` carries `?v=<updatedAt>`, so a refresh busts it. */
const CARD_CACHE = "max-age=600, stale-while-revalidate=3600";
/** Discord caches whatever it gets, so an untracked player gets a 200 that expires quickly. */
const PLACEHOLDER_CACHE = "max-age=60";

const png = (bytes: Uint8Array<ArrayBuffer>, edge: string) =>
  new Response(bytes, { headers: { "Content-Type": "image/png", ...cacheHeaders(edge) } });

/** The Discord unfurl image: the bot's general card for a player, by UUID. Never calls Hypixel. */
export const Route = createFileRoute("/og/{$uuid}.png")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const uuid = params.uuid.toLowerCase();

        if (!UUID.test(uuid)) {
          return new Response(null, { status: 404, headers: cacheHeaders("max-age=300") });
        }

        try {
          const image = await renderPlayerImage({ uuid, variant: "og" });
          return png(image.png, image.kind === "card" ? CARD_CACHE : PLACEHOLDER_CACHE);
        } catch (error) {
          if (error instanceof PoolBusyError) {
            return new Response(null, {
              status: 503,
              headers: { "Retry-After": String(error.retryAfter), "Cache-Control": "no-store" },
            });
          }

          if (error instanceof SkinUnavailableError) {
            return new Response(null, { status: 502, headers: { "Cache-Control": "no-store" } });
          }

          throw error;
        }
      },
    },
  },
});
