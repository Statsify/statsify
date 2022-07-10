/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { UserTheme } from "@statsify/schemas";

export class UserDto {
  @ApiProperty({ description: "Discord ID or UUID" })
  @IsString()
  @MinLength(17)
  @MaxLength(36)
  public tag: string;
}

export class UpdateUserDto {
  @IsBoolean()
  @IsOptional()
  public serverMember?: boolean;

  @IsOptional()
  @ValidateNested()
  public theme?: UserTheme;
}
