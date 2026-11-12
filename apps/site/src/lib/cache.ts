/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * Browsers always revalidate; the edge TTL goes in `CDN-Cache-Control`, which Cloudflare
 * honors and strips. (`s-maxage` + `stale-while-revalidate` does not work on Cloudflare.)
 */
const BROWSER_CACHE_CONTROL = "public, max-age=0, must-revalidate";

export function cacheHeaders(edge: string): Record<string, string> {
  return {
    "Cache-Control": BROWSER_CACHE_CONTROL,
    "CDN-Cache-Control": edge,
  };
}

/** The edge keeps a 404 for five minutes. */
export const NOT_FOUND_EDGE = "max-age=300";

export const NO_STORE = { "Cache-Control": "no-store" };

/** For a response whose route would otherwise set an edge TTL. */
export const NO_STORE_EDGE = { "Cache-Control": "no-store", "CDN-Cache-Control": "no-store" };

/** How long a visitor should wait after the API or a server route failed. */
export const RETRY_AFTER_SECONDS = 30;
