/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/** A Minecraft UUID in a URL: 32 hex digits, with or without the four dashes, in any case. */
export const UUID_PATTERN = /^[\da-f]{32}$|^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

/** The account whose skin stands in for players we have nothing to show yet. */
export const PLACEHOLDER_UUID = "76a56ac7fcf649fca0531cb5c77cd9ae";
