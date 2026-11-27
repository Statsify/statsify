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

export class GuildRankingDto extends createZodDto(
  z.object({
    fields: z.array(leaderboardField(Guild)),
    id: z.string().length(24),
  })
) {}
