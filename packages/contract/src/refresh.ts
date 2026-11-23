/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * How old a save is before its page updates it by itself once it opens. Its own entry point, so the browser reads it
 * without loading zod.
 */
export const AUTO_UPDATE_AGE_MS = 15 * 60_000;

/**
 * Why a page updates a profile by itself: `stale`, its save is `AUTO_UPDATE_AGE_MS` old; `searched`, the search opened
 * it, so it updates once past the cooldown, as a bot command does.
 */
export const AUTO_UPDATES = ["stale", "searched"] as const;

export type AutoUpdate = (typeof AUTO_UPDATES)[number];
