/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddKeyDto {
  @IsString()
  @ApiProperty()
  public name: string;
}

export class KeyParamDto {
  @IsString()
  @ApiProperty()
  public key: string;
}

export class KeyHeaderDto {
  @IsString()
  @ApiProperty()
  public 'x-api-key': string;
}
