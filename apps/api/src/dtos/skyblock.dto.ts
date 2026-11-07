/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CachedPlayerDto } from "./cached-player.dto.js";
import { ICON_SIZES, type IconSize } from "@statsify/skyblock/icon-key";
import { IsArray, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { PlayerDto } from "./player.dto.js";
import { SKYBLOCK_SECTIONS, type SkyBlockSection } from "@statsify/skyblock";
import { SkyBlockStats, getLeaderboardFields } from "@statsify/schemas";
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

export class SkyBlockIconDto {
  @IsString()
  @MaxLength(70)
  @ApiProperty({ example: "item-276-0", description: "item-<id>-<damage>[-<colour hex>] or head-<skin hash>" })
  public texture: string;

  @Transform(({ value }) => +value)
  @IsIn(ICON_SIZES)
  @ApiProperty({ enum: ICON_SIZES })
  public size: IconSize;

  @IsOptional()
  @Transform(({ value }) => +value)
  @IsIn([0, 1])
  @ApiProperty({ required: false, enum: [0, 1], default: 0 })
  public glint: 0 | 1 = 0;
}

export class SkyBlockItemsDto {
  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: "hyperion" })
  public query: string;
}

const leaderboardFields = getLeaderboardFields(SkyBlockStats).map(([key]) => key);

export class SkyBlockLeaderboardDto extends PartialType(PlayerDto) {
  @IsEnum(leaderboardFields)
  @ApiProperty({ enum: leaderboardFields })
  public field: string;

  @Transform((params) => +params.value)
  @IsInt()
  @Min(0)
  @ApiProperty({ default: 0, minimum: 0, type: () => Number, required: false })
  public page = 0;

  @Transform((params) => +params.value)
  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiProperty({ minimum: 1, type: () => Number, required: false })
  public position?: number;
}
