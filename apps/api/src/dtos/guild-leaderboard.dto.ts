/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { Guild } from "@statsify/schemas";
import { leaderboardField } from "./leaderboard-field.js";
import { z } from "zod";

const field = leaderboardField(Guild);

export class GuildLeaderboardDto {
  public static schema = z.object({
    field,
    page: z.coerce.number().int().min(0).default(0),
    position: z.coerce.number().int().min(1).optional(),
    guild: z.string().min(3).max(32).nullish(),
  });

  @ApiProperty({ enum: field.options })
  public field: string;

  @ApiProperty({ default: 0, minimum: 0, type: () => Number, required: false })
  public page: number;

  @ApiProperty({ minimum: 1, type: () => Number, required: false })
  public position?: number;

  @ApiProperty({ required: false })
  public guild?: string;
}
