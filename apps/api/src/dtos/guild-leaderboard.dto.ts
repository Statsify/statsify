/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Guild } from "@statsify/schemas";
import { createZodDto } from "nestjs-zod";
import { leaderboardField } from "./leaderboard-field.js";
import { z } from "zod";

export class GuildLeaderboardDto extends createZodDto(
  z.object({
    field: leaderboardField(Guild),
    page: z.coerce.number().int().min(0).default(0),
    position: z.coerce.number().int().min(1).optional(),
    guild: z.string().min(3).max(32).nullish(),
  })
) {}
