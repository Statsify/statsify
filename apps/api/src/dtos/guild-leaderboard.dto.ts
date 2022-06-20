/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from '@nestjs/swagger';
import { Guild, LeaderboardScanner } from '@statsify/schemas';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const fields = LeaderboardScanner.getLeaderboardFields(Guild);

export class GuildLeaderboardDto {
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
  @Max(500_000)
  @ApiProperty({ minimum: 1, maximum: 500_000, type: () => Number, required: false })
  public position?: number;

  @IsOptional()
  @IsString()
  @MinLength(24)
  @MaxLength(24)
  @ApiProperty({ required: false })
  public id?: string;
}
