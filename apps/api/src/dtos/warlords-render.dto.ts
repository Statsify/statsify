/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { MAX_SIZE, MIN_SIZE } from "./scene-camera.dto.js";
import { Transform } from "class-transformer";

export const WARLORDS_CAMERA = {
  player: { width: 600, height: 800, yaw: -Math.PI / 6, pitch: Math.PI / 18 },
  weapon: { width: 600, height: 600, yaw: -Math.PI / 6, pitch: Math.PI / 18 },
};

export class WarlordsRenderDto {
  @IsOptional()
  @IsString()
  @MaxLength(36)
  @MinLength(32)
  @ApiProperty({ required: false, description: "The player standing in their class's helmet and armor. Without one, only the weapon is drawn" })
  public uuid?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: "The player's stored chosen_class: mage, warrior, paladin or shaman. Needed with a uuid" })
  public class?: string;

  @IsOptional()
  @Transform(({ value }) => +value)
  @IsInt()
  @Min(0)
  @ApiProperty({ required: false, default: 0, description: "The class's stored <class>_helmet_selection, from 0 to 3" })
  public helmet?: number;

  @IsOptional()
  @Transform(({ value }) => +value)
  @IsInt()
  @Min(0)
  @ApiProperty({ required: false, default: 0, description: "The class's stored <class>_armor_selection, from 0 to 2" })
  public armor?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, default: "blue", description: "The team colors the helmet and armor are drawn in: blue or red" })
  public team?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: "The held weapon's stored weapon_inventory material, such as STONE_HOE" })
  public weapon?: string;

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
  @ApiProperty({ required: false, default: WARLORDS_CAMERA.player.yaw, description: "Camera angle around the player or weapon in radians: 0 faces the front, π the back" })
  public yaw?: number;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : +value))
  @IsNumber()
  @Min(-Math.PI / 2)
  @Max(Math.PI / 2)
  @ApiProperty({ required: false, default: WARLORDS_CAMERA.player.pitch, description: "Camera angle above the horizon in radians" })
  public pitch?: number;

  @IsOptional()
  @Transform(({ value }) => +value)
  @IsInt()
  @Min(MIN_SIZE)
  @Max(MAX_SIZE)
  @ApiProperty({ required: false, default: WARLORDS_CAMERA.player.width, minimum: MIN_SIZE, maximum: MAX_SIZE })
  public width?: number;

  @IsOptional()
  @Transform(({ value }) => +value)
  @IsInt()
  @Min(MIN_SIZE)
  @Max(MAX_SIZE)
  @ApiProperty({ required: false, default: WARLORDS_CAMERA.player.height, minimum: MIN_SIZE, maximum: MAX_SIZE, description: `${WARLORDS_CAMERA.weapon.height} for a weapon alone` })
  public height?: number;
}
