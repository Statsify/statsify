/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { CachedPlayerDto } from "./cached-player.dto.js";
import { IsArray, IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { SKYBLOCK_SECTIONS, type SkyBlockSection } from "@statsify/skyblock";
import { Transform } from "class-transformer";

export class SkyBlockProfileDto extends CachedPlayerDto {
  @IsOptional()
  @IsString()
  @MaxLength(36)
  @ApiProperty({
    required: false,
    example: "Strawberry",
    description: "A profile id or cute name; the player's selected profile by default",
  })
  public profile?: string;

  @Transform(({ value }) => (typeof value === "string" ? value.split(",").filter(Boolean) : value))
  @IsArray()
  @IsIn(SKYBLOCK_SECTIONS, { each: true })
  @ApiProperty({
    type: String,
    example: "skills,networth",
    description: `Comma-separated sections of the member to compute: ${SKYBLOCK_SECTIONS.join(", ")}`,
  })
  public sections: SkyBlockSection[];
}

export class SkyBlockPriceDto {
  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: "HYPERION", description: "A price key from /skyblock/items" })
  public item: string;
}

export class SkyBlockItemsDto {
  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: "hyperion" })
  public query: string;
}
