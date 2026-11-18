/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/** For the `head()` links of routes with Mona Sans labels or body text; Minecraft-only pages skip it. */
export const SANS_PRELOAD = {
  rel: "preload",
  href: "/fonts/StatsifySans-latin.woff2",
  as: "font",
  type: "font/woff2",
  crossOrigin: "anonymous",
} as const;
