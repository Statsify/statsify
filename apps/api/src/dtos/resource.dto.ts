/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ResourceDto {
  @IsString()
  @ApiProperty({
    example: "games",
    description: "The path to the resource in hypixel api",
  })
  public path: string;
}
