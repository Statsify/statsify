/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import z from "zod";

export const Caching = z.enum(["Live", "Cached", "CacheOnly"]).optional().default("Cached");

export const PlayerTag = z.union([
  z.string().min(1).max(16).toLowerCase(),
  // [TODO]: Add support for dashless UUIDs
  z.string().uuid().toLowerCase().transform((uuid) => uuid.replaceAll("-", "")),
]);

export const GuildInput = z.discriminatedUnion("type", [
  z.object({ type: z.literal("id"), tag: z.string().uuid() }),
  z.object({ type: z.literal("name"), tag: z.string().min(1).max(32).toLowerCase() }),
  z.object({ type: z.literal("member"), tag: PlayerTag }),
]);
