/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/** A redirect to a player's current name. Names change hands, so it's kept for an hour rather than forever. */
export const REDIRECT_HEADERS = { "Cache-Control": "public, max-age=3600", "CDN-Cache-Control": "max-age=3600" };

export const possessive = (username: string) => `${username}'${username.endsWith("s") ? "" : "s"}`;
