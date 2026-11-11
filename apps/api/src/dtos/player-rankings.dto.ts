/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { Player } from "@statsify/schemas";
import { UuidDto } from "./uuid.dto.js";
import { leaderboardField } from "./leaderboard-field.js";
import { z } from "zod";

const field = leaderboardField(Player);

export class PlayerRankingsDto extends UuidDto {
  public static override schema = UuidDto.schema.extend({ fields: z.array(field) });

  @ApiProperty({ enum: field.options, type: [String] })
  public fields: string[];
}
