/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * For the `head()` links of pages with Mona Sans reading text in the first screen (the player-not-found explanation);
 * everything else on the inner pages is Minecraft, and Mona Sans further down loads when it is laid out.
 */
export const SANS_PRELOAD = {
  rel: "preload",
  href: "/fonts/StatsifySans-latin.woff2",
  as: "font",
  type: "font/woff2",
  crossOrigin: "anonymous",
} as const;
