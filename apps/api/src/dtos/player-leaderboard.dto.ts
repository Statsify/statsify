/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, Min } from "class-validator";
import { LeaderboardScanner, Player } from "@statsify/schemas";
import { PlayerDto } from "./player.dto.js";
import { Transform } from "class-transformer";

const fields = LeaderboardScanner.getLeaderboardFields(Player).map(([key]) => key);

export class PlayerLeaderboardDto extends PartialType(PlayerDto) {
  @IsEnum(fields)
  @ApiProperty({ enum: fields })
  public field: string;

  @Transform((params) => +params.value)
  @IsInt()
  @Min(0)
  @ApiProperty({ default: 0, minimum: 0, type: () => Number, required: false })
  public page = 0;

  @Transform((params) => +params.value)
  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiProperty({ minimum: 1, type: () => Number, required: false })
  public position?: number;
}
