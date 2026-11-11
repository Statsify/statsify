/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import type { ArmorPiece, RenderOptions } from "@statsify/skin-renderer";
import { IsBoolean, IsEmpty, IsIn, IsInt, IsNumber, IsObject, IsOptional, Matches, Max, Min, ValidateIf, ValidateNested } from "class-validator";
import { Transform, Type, plainToInstance } from "class-transformer";
import { UuidDto } from "./uuid.dto.js";

const POSES = ["standing", "punch", "sneak", "jump", "swim", "fly"] as const satisfies readonly NonNullable<RenderOptions["pose"]>[];

const ARMOR_MATERIALS = ["leather", "chainmail", "iron", "gold", "diamond"] as const satisfies readonly ArmorPiece["material"][];

class ArmorPieceDto {
  @IsIn(ARMOR_MATERIALS)
  public material: ArmorPiece["material"];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(0xFF_FF_FF)
  public color?: number;

  @IsOptional()
  @IsBoolean()
  public enchanted?: boolean;
}

// The hex after textures.minecraft.net/texture/, which older textures write with fewer than 64 digits
const TEXTURE_HASH = /^[\da-f]{1,64}$/;

class PlayerHeadDto {
  @Matches(TEXTURE_HASH)
  public head: string;

  // A helmet is either a head or a material, never both
  @IsEmpty()
  public material?: undefined;

  // Accepted so an enchanted head validates, but the game draws no glint on a worn head
  @IsOptional()
  @IsBoolean()
  public enchanted?: boolean;
}

// IsOptional also lets null through, which the renderer rejects with a 500
const isSet = (_: unknown, value: unknown) => value !== undefined;

class ArmorDto {
  @ValidateIf(isSet)
  @IsObject()
  @ValidateNested()
  @Type((options) => (options?.object.helmet?.head === undefined ? ArmorPieceDto : PlayerHeadDto))
  public helmet?: ArmorPieceDto | PlayerHeadDto;

  @ValidateIf(isSet)
  @IsObject()
  @ValidateNested()
  @Type(() => ArmorPieceDto)
  public chestplate?: ArmorPieceDto;

  @ValidateIf(isSet)
  @IsObject()
  @ValidateNested()
  @Type(() => ArmorPieceDto)
  public leggings?: ArmorPieceDto;

  @ValidateIf(isSet)
  @IsObject()
  @ValidateNested()
  @Type(() => ArmorPieceDto)
  public boots?: ArmorPieceDto;
}

export class SkinRenderDto extends UuidDto {
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : +value))
  @IsNumber()
  @Min(-Math.PI * 2)
  @Max(Math.PI * 2)
  @ApiProperty({ required: false, description: "Camera angle around the player in radians: 0 faces the front, π the back" })
  public yaw?: number;

  @IsOptional()
  @IsIn(POSES)
  @ApiProperty({ required: false, enum: POSES })
  public pose?: (typeof POSES)[number];

  @IsOptional()
  @Transform(({ value }) => (value === "true" || value === "false" ? value === "true" : value))
  @IsBoolean()
  @ApiProperty({ required: false, description: "Draw the player's cape, if they have one" })
  public cape?: boolean;

  // Bad JSON passes through unparsed so validation answers 400, where a throw here would be a 500
  @ValidateIf(isSet)
  @Transform(({ value }) => {
    try {
      return plainToInstance(ArmorDto, JSON.parse(value));
    } catch {
      return value;
    }
  })
  @IsObject()
  @ValidateNested()
  @ApiProperty({
    required: false,
    type: String,
    description: "JSON, e.g. {\"helmet\":{\"head\":\"5797c77ccee3c04c3deed770595ea83ea1e84c9a4629b753af5d351c0cc11a74\"},\"chestplate\":{\"material\":\"leather\",\"color\":16711680,\"enchanted\":true}}",
  })
  public armor?: ArmorDto;
}
