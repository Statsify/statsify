/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import z from "zod";
import { Caching } from "#validation";

export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;

export const shouldCache = (record: { expiresAt: number }, caching: z.TypeOf<typeof Caching>) => caching === "CacheOnly" || (caching === "Cached" && record.expiresAt > Date.now());
