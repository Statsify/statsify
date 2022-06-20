/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from '@nestjs/swagger';
import { Guild, LeaderboardScanner } from '@statsify/schemas';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

const fields = LeaderboardScanner.getLeaderboardFields(Guild);

export class GuildRankingDto {
  @IsEnum(fields)
  @ApiProperty({ enum: fields })
  public field: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @ApiProperty()
  public name: string;
}
