/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { LeaderboardScanner, Player } from '@statsify/schemas';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PlayerDto } from './player.dto';

const fields = LeaderboardScanner.getLeaderboardFields(Player);

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
  @Max(100_000)
  @ApiProperty({ minimum: 1, maximum: 100_000, type: () => Number, required: true })
  public position?: number;
}
