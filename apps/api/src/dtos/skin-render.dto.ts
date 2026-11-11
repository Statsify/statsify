/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import type { ArmorPiece, RenderOptions } from "@statsify/skin-renderer";
import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, Max, Min, ValidateNested } from "class-validator";
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

class ArmorDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ArmorPieceDto)
  public helmet?: ArmorPieceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ArmorPieceDto)
  public chestplate?: ArmorPieceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ArmorPieceDto)
  public leggings?: ArmorPieceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ArmorPieceDto)
  public boots?: ArmorPieceDto;
}

export class SkinRenderDto extends UuidDto {
  @IsOptional()
  @Transform(({ value }) => +value)
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
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  @ApiProperty({ required: false, description: "Draw the player's cape, if they have one" })
  public cape?: boolean;

  // Bad JSON passes through unparsed so validation answers 400, where a throw here would be a 500
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return plainToInstance(ArmorDto, JSON.parse(value));
    } catch {
      return value;
    }
  })
  @ValidateNested()
  @ApiProperty({
    required: false,
    type: String,
    description: "JSON, e.g. {\"chestplate\":{\"material\":\"leather\",\"color\":16711680,\"enchanted\":true}}",
  })
  public armor?: ArmorDto;
}
