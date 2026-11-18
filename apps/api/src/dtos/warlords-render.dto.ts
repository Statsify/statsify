/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { SceneCameraDto } from "./scene-camera.dto.js";
import { Transform } from "class-transformer";

export const WARLORDS_CAMERA = {
  player: { width: 600, height: 800, yaw: -Math.PI / 6, pitch: Math.PI / 18 },
  weapon: { width: 600, height: 600, yaw: -Math.PI / 6, pitch: Math.PI / 18 },
  mount: { width: 600, height: 800, yaw: (-2 * Math.PI) / 9, pitch: (5 * Math.PI) / 72 },
};

export class WarlordsRenderDto extends SceneCameraDto(WARLORDS_CAMERA.player, {
  yaw: `Camera angle around the scene in radians: 0 faces the front, π the back. ${WARLORDS_CAMERA.mount.yaw.toFixed(2)} with a mount`,
  pitch: `Camera angle above the horizon in radians. ${WARLORDS_CAMERA.mount.pitch.toFixed(2)} with a mount`,
  height: `${WARLORDS_CAMERA.weapon.height} for a weapon alone`,
}) {
  @IsOptional()
  @IsString()
  @MaxLength(36)
  @MinLength(32)
  @ApiProperty({ required: false, description: "The player in their class's helmet and armor. Without one, only the weapon or mount is drawn" })
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
  @IsString()
  @ApiProperty({ required: false, description: "The player's stored selected_mount, such as noble_steed, which the player rides. Without a uuid, the mount is drawn alone" })
  public mount?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "true" || value === "false" ? value === "true" : value))
  @IsBoolean()
  @ApiProperty({ required: false, default: false, description: "Draw the skin's outer layer in 3D" })
  public extruded?: boolean;
}
