/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, Max, Min } from "class-validator";
import { Transform } from "class-transformer";

export class PlayerStaleDto {
  @Transform((params) => +params.value)
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(50_000)
  @ApiPropertyOptional({ default: 10_000 })
  public limit: number = 10_000;

  @Transform((params) => +params.value)
  @IsNumber()
  @IsOptional()
  @Min(1)
  @ApiPropertyOptional({ default: 7 })
  public staleAfterDays: number = 7;
}
