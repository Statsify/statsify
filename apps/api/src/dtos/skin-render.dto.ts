/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, Max, Min } from "class-validator";
import { Transform } from "class-transformer";
import { UuidDto } from "./uuid.dto.js";

export class SkinRenderDto extends UuidDto {
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsNumber()
  @Min(-Math.PI * 2)
  @Max(Math.PI * 4)
  @ApiPropertyOptional({ description: "Camera horizontal angle in radians (yaw). Defaults to -0.3." })
  public yaw?: number;
}
