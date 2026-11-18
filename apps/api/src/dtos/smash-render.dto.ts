/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { SceneCameraDto } from "./scene-camera.dto.js";
import { Transform } from "class-transformer";
import { WARLORDS_CAMERA } from "./warlords-render.dto.js";

export const SMASH_CAMERA = WARLORDS_CAMERA.player;

export class SmashRenderDto extends SceneCameraDto(SMASH_CAMERA) {
  @IsString()
  @ApiProperty({ description: "The player's stored active_class, such as GENERAL_CLUCK" })
  public hero: string;

  @IsOptional()
  @Transform(({ value }) => (value === "true" || value === "false" ? value === "true" : value))
  @IsBoolean()
  @ApiProperty({ required: false, default: false, description: "Draw the hero's Master Skin, the player's stored masterArmor_<hero>" })
  public master?: boolean;
}
