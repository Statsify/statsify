/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { MAX_SIZE, MIN_SIZE } from "./kart-render.dto.js";
import { Transform } from "class-transformer";
import { WARLORDS_CAMERA } from "./warlords-render.dto.js";

export const SMASH_CAMERA = WARLORDS_CAMERA.player;

export class SmashRenderDto {
  @IsString()
  @ApiProperty({ description: "The player's stored active_class, such as GENERAL_CLUCK" })
  public hero: string;

  @IsOptional()
  @Transform(({ value }) => (value === "true" || value === "false" ? value === "true" : value))
  @IsBoolean()
  @ApiProperty({ required: false, default: false, description: "Draw the hero's Master Skin, the player's stored masterArmor_<hero>" })
  public master?: boolean;

  // An empty ?yaw= keeps the default angle, where +"" would turn it to the front
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : +value))
  @IsNumber()
  @Min(-Math.PI * 2)
  @Max(Math.PI * 2)
  @ApiProperty({ required: false, default: SMASH_CAMERA.yaw, description: "Camera angle around the hero in radians: 0 faces the front, π the back" })
  public yaw?: number;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : +value))
  @IsNumber()
  @Min(-Math.PI / 2)
  @Max(Math.PI / 2)
  @ApiProperty({ required: false, default: SMASH_CAMERA.pitch, description: "Camera angle above the horizon in radians" })
  public pitch?: number;

  @IsOptional()
  @Transform(({ value }) => +value)
  @IsInt()
  @Min(MIN_SIZE)
  @Max(MAX_SIZE)
  @ApiProperty({ required: false, default: SMASH_CAMERA.width, minimum: MIN_SIZE, maximum: MAX_SIZE })
  public width?: number;

  @IsOptional()
  @Transform(({ value }) => +value)
  @IsInt()
  @Min(MIN_SIZE)
  @Max(MAX_SIZE)
  @ApiProperty({ required: false, default: SMASH_CAMERA.height, minimum: MIN_SIZE, maximum: MAX_SIZE })
  public height?: number;
}
