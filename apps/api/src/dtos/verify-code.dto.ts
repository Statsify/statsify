/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { UuidDto } from "./uuid.dto";

export class VerifyCodeDto extends PartialType(UuidDto) {
  @ApiProperty({ description: "Discord ID" })
  @IsString()
  @MinLength(17)
  public id: string;

  @ApiProperty({ description: "Verification Code" })
  @IsString()
  @IsOptional()
  @MinLength(4)
  @MaxLength(4)
  public code?: string;
}
