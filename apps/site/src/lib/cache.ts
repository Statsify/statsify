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

/** For a file served under its content's hash, which never changes. */
export const IMMUTABLE_HEADERS = { "Cache-Control": "public, max-age=31536000, immutable", "CDN-Cache-Control": "max-age=31536000" };
