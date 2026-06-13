/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, Min } from "class-validator";
import { Transform } from "class-transformer";

export class ActiveUsersDto {
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsInt()
  @Min(1)
  @ApiProperty({
    description: "The number of days to count active users over",
    required: false,
  })
  public days?: number;
}
