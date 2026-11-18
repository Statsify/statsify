/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { AutocompleteType } from "@statsify/api-client";
import { IsEnum, IsString, MaxLength } from "class-validator";
import { UserIdDto } from "./user.dto.js";

export class AutocompleteDto extends UserIdDto {
  @IsEnum(AutocompleteType)
  @ApiProperty({ enum: AutocompleteType, enumName: "AutocompleteType" })
  public type: AutocompleteType;

  @IsString()
  @MaxLength(32)
  @ApiProperty()
  public query: string;
}

export class AutocompleteHistoryDto extends UserIdDto {
  @IsEnum(AutocompleteType)
  @ApiProperty({ enum: AutocompleteType, enumName: "AutocompleteType" })
  public type: AutocompleteType;

  @IsString()
  @MaxLength(32)
  @ApiProperty({ description: "A player's username or a guild's name" })
  public name: string;
}
