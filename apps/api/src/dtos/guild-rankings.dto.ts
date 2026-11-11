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

export class GuildRankingDto {
  public static schema = z.object({
    fields: z.array(field),
    id: z.string().min(24).max(24),
  });

  @ApiProperty({ enum: field.options, type: [String] })
  public fields: string[];

  @ApiProperty()
  public id: string;
}
