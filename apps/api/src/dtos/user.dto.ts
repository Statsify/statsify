/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UserDto {
  @ApiProperty({ description: 'Discord ID or UUID' })
  @IsString()
  @MinLength(17)
  @MaxLength(36)
  public tag: string;
}
