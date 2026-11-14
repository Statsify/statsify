/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export const KART_CAMERA = { width: 600, height: 450, yaw: -Math.PI / 6, pitch: Math.PI / 10 };

const MIN_SIZE = 64;
const MAX_SIZE = 2048;

export class KartRenderDto {
  @IsString()
  @ApiProperty({ description: "The player's stored skin_active, such as YELLOW_KART;DRAGON_TAMER" })
  public kart: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  @MinLength(32)
  @ApiProperty({ required: false, description: "The player seated in the kart. Without one, the kart is drawn empty" })
  public uuid?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: "The player's stored helmet_active, such as HELMET_5_5 or NO_HELMET" })
  public helmet?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: "The player's stored jacket_active, such as GOLD_JACKET, LEATHER_JACKET:RED or NO_JACKET" })
  public jacket?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: "The player's stored pants_active, such as GOLD_PANTS or NO_PANTS" })
  public pants?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: "The player's stored shoes_active, such as GOLD_SHOES or NO_SHOES" })
  public shoes?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "true" || value === "false" ? value === "true" : value))
  @IsBoolean()
  @ApiProperty({ required: false, default: false, description: "Draw the skin's outer layer in 3D" })
  public extruded?: boolean;

  // An empty ?yaw= keeps the default angle, where +"" would turn it to the front
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : +value))
  @IsNumber()
  @Min(-Math.PI * 2)
  @Max(Math.PI * 2)
  @ApiProperty({ required: false, default: KART_CAMERA.yaw, description: "Camera angle around the kart in radians: 0 faces the front, π the back" })
  public yaw?: number;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : +value))
  @IsNumber()
  @Min(-Math.PI / 2)
  @Max(Math.PI / 2)
  @ApiProperty({ required: false, default: KART_CAMERA.pitch, description: "Camera angle above the horizon in radians" })
  public pitch?: number;

  @IsOptional()
  @Transform(({ value }) => +value)
  @IsInt()
  @Min(MIN_SIZE)
  @Max(MAX_SIZE)
  @ApiProperty({ required: false, default: KART_CAMERA.width, minimum: MIN_SIZE, maximum: MAX_SIZE })
  public width?: number;

  @IsOptional()
  @Transform(({ value }) => +value)
  @IsInt()
  @Min(MIN_SIZE)
  @Max(MAX_SIZE)
  @ApiProperty({ required: false, default: KART_CAMERA.height, minimum: MIN_SIZE, maximum: MAX_SIZE })
  public height?: number;
}
