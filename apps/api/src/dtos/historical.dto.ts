/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { HistoricalTimes, HistoricalType } from "@statsify/api-client";
import { IsEnum } from "class-validator";
import { PlayerDto } from "./player.dto";

export class HistoricalDto extends PlayerDto {
  @ApiProperty({
    enum: HistoricalTimes,
    enumName: "HistoricalTimes",
    example: HistoricalTimes.DAILY,
    description: "Determines whether to send daily, weekly, or monthly data.",
  })
  @IsEnum(HistoricalTimes)
  public type: HistoricalType;
}
