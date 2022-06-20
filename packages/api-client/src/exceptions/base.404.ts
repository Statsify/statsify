/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { NotFoundException as BaseNotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class NotFoundException extends BaseNotFoundException {
  @ApiProperty()
  public statusCode: number;

  @ApiProperty()
  public message: string;

  @ApiProperty()
  public error: string;
}
