/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";
import { Transform } from "class-transformer";

export class PlayerGroupDto {
  @Transform((params) => +params.value)
  @IsNumber()
  @Min(0)
  @ApiProperty()
  public start: number;

  @Transform((params) => +params.value)
  @IsNumber()
  @ApiProperty()
  public end: number;
}
