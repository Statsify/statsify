/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { isUuid } from "@statsify/util/util";

/** The account whose skin stands in for players we have nothing to show yet. */
export const PLACEHOLDER_UUID = "76a56ac7fcf649fca0531cb5c77cd9ae";

/**
 * A name or UUID that could be a player's. A name is letters, digits and underscores, at most 16 of them (some of the
 * oldest are shorter than today's 3).
 */
export const isPlayerTag = (value: string): boolean => /^\w{1,16}$/.test(value) || isUuid(value);

/** An undashed UUID with its four dashes, as Minecraft's servers print it. */
export const dashedUuid = (compact: string): string => compact.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
