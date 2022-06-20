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
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

const fields = LeaderboardScanner.getLeaderboardFields(Guild);

export class GuildLeaderboardDto {
  @IsEnum(fields)
  @ApiProperty({ enum: fields })
  public field: string;

  @Transform((params) => +params.value)
  @IsInt()
  @Min(0)
  @ApiProperty({ default: 0, minimum: 0, type: () => Number })
  public page = 0;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @ApiProperty({ required: false })
  public name?: string;
}
