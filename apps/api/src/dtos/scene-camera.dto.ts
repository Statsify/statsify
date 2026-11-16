/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";
import { Transform } from "class-transformer";

export const MIN_SIZE = 64;
export const MAX_SIZE = 1024;

export function SceneCameraDto(
  camera: { yaw: number; pitch: number; width: number; height: number },
  descriptions: { yaw?: string; pitch?: string; height?: string } = {}
) {
  class SceneCamera {
    // An empty ?yaw= keeps the default angle, where +"" would turn it to the front
    @IsOptional()
    @Transform(({ value }) => (value === "" ? undefined : +value))
    @IsNumber()
    @Min(-Math.PI * 2)
    @Max(Math.PI * 2)
    @ApiProperty({ required: false, default: camera.yaw, description: descriptions.yaw ?? "Camera angle around the scene in radians: 0 faces the front, π the back" })
    public yaw?: number;

    @IsOptional()
    @Transform(({ value }) => (value === "" ? undefined : +value))
    @IsNumber()
    @Min(-Math.PI / 2)
    @Max(Math.PI / 2)
    @ApiProperty({ required: false, default: camera.pitch, description: descriptions.pitch ?? "Camera angle above the horizon in radians" })
    public pitch?: number;

    @IsOptional()
    @Transform(({ value }) => +value)
    @IsInt()
    @Min(MIN_SIZE)
    @Max(MAX_SIZE)
    @ApiProperty({ required: false, default: camera.width, minimum: MIN_SIZE, maximum: MAX_SIZE })
    public width?: number;

    @IsOptional()
    @Transform(({ value }) => +value)
    @IsInt()
    @Min(MIN_SIZE)
    @Max(MAX_SIZE)
    @ApiProperty({ required: false, default: camera.height, minimum: MIN_SIZE, maximum: MAX_SIZE, description: descriptions.height })
    public height?: number;
  }

  return SceneCamera;
}
