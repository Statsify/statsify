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
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Transform } from "class-transformer";

export class UserIdDto {
  @ApiProperty({ description: "Discord ID" })
  @IsString()
  @MinLength(17)
  @MaxLength(20)
  public id: string;
}

export class UserDto {
  @ApiProperty({ description: "Discord ID or UUID" })
  @IsString()
  @MinLength(17)
  @MaxLength(36)
  public tag: string;
}

class UserTheme {
  @IsOptional()
  @IsString()
  public font?: string;

  @IsOptional()
  @IsString()
  public palette?: string;

  @IsOptional()
  @IsString()
  public boxes?: string;
}

class UserFooter {
  @IsOptional()
  @IsString()
  public message?: string;

  @IsOptional()
  @IsNumber()
  public icon?: number;
}

export class UpdateUserDto {
  @IsBoolean()
  @IsOptional()
  public serverMember?: boolean;

  @IsOptional()
  @ValidateNested()
  @Transform((params) => {
    const theme = new UserTheme();
    Object.assign(theme, params.value);
    return theme;
  })
  public theme?: UserTheme;

  @IsOptional()
  @ValidateNested()
  @Transform((params) => {
    const footer = new UserFooter();
    Object.assign(footer, params.value);
    return footer;
  })
  public footer?: UserFooter;

  @IsString()
  @IsOptional()
  public locale?: string;
}
