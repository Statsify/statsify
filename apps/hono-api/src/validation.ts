/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { z } from "zod";

export const UuidSchema = z.string();
export const DiscordIdSchema = z.string();
export const UsernameSchema = z.string().min(1);
export const VerifyCodeSchema = z.string().length(4);

export const PlayerSlugSchema = z.union([
  UuidSchema,
  UsernameSchema,
]);

export const UserSlugSchema = z.union([
  UuidSchema,
  DiscordIdSchema,
]);
