/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({ description: 'Discord ID' })
  @IsString()
  @MinLength(17)
  public id: string;

  @ApiProperty({ description: 'Verification Code' })
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  public code: string;
}
