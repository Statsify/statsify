/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { LeaderboardScanner, Player } from "@statsify/schemas";
import { UuidDto } from "./uuid.dto";

const fields = LeaderboardScanner.getLeaderboardFields(Player).map(([key]) => key);

export class PlayerRankingsDto extends UuidDto {
  @ApiProperty({ enum: fields, type: [String] })
  @IsEnum(fields, { each: true })
  public fields: string[];
}
