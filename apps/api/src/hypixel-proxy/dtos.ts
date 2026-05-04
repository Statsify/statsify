/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RawHypixelPlayerDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  @ApiProperty({
    required: false,
    example: "20934ef9488c465180a78f861586b4cf",
    description: "A player's UUID.",
  })
  public uuid?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(16)
  @ApiProperty({
    required: false,
    example: "j4cobi",
    description: "A player's username.",
  })
  public name?: string;
}

export class RawHypixelGuildDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  @ApiProperty({
    required: false,
    example: "66f5afec8ea8c9b409f58739",
    description: "A guild id.",
  })
  public id?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  @ApiProperty({
    required: false,
    example: "BlueBloods",
    description: "A guild name.",
  })
  public name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  @ApiProperty({
    required: false,
    example: "j4cobi",
    description: "A player UUID or username.",
  })
  public player?: string;
}
