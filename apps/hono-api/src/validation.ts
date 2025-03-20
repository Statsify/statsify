/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { z } from "zod";

export const UuidSchema = z
  .string()
  .transform((value) => value.toLowerCase().replaceAll("-", ""))
  .pipe(z.string().length(32).regex(/^[0-9a-f]{8}[0-9a-f]{4}4[0-9a-f]{3}[089ab][0-9a-f]{3}[0-9a-f]{12}/i, "Invalid UUID"))
  .describe("UUID v4");

export const DiscordIdSchema = z.string();

export const UsernameSchema = z.string()
  .min(1)
  .max(16)
  .transform((username) => username.toLowerCase())
  .describe("Minecraft Username");

export const VerifyCodeSchema = z.string().length(4);

export const PlayerSlugSchema = z.union([
  UuidSchema,
  UsernameSchema,
]);

export const UserSlugSchema = z.union([
  UuidSchema,
  DiscordIdSchema,
]);

export const CacheLevelSchema = z.enum(["Cache", "CacheOnly", "Live"]);
export type CacheLevel = z.infer<typeof CacheLevelSchema>;
