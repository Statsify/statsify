/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { notFoundMeta } from "./social-meta";

/** A player's pages: fresh for a minute, stale for ten, and served stale for a day if the API is down. */
export const EDGE_CACHE = "max-age=60, stale-while-revalidate=600, stale-if-error=86400";

/** A redirect to a player's current name. Names change hands, so it's kept for an hour rather than forever. */
export const REDIRECT_HEADERS = { "Cache-Control": "public, max-age=3600", "CDN-Cache-Control": "max-age=3600" };

export const possessive = (username: string) => `${username}'${username.endsWith("s") ? "" : "s"}`;

/** The head of a player's page that isn't there. */
export const notFoundHead = (title: string) => ({ meta: notFoundMeta(title) });
