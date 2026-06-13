/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CommandDto {
  @IsString()
  @ApiProperty()
  public command: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  public userId?: string;
}
