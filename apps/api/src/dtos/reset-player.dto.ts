/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CurrentHistoricalType } from "@statsify/api-client";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { PlayerDto } from "./player.dto";
import { Transform } from "class-transformer";

export class ResetPlayerDto extends PlayerDto {
  @IsOptional()
  @Transform((params) => +params.value)
  @IsInt()
  @Min(0)
  @Max(1440)
  public resetMinute?: number;

  @IsOptional()
  @IsEnum(CurrentHistoricalType)
  public type?: CurrentHistoricalType;
}
