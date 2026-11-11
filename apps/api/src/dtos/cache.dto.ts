/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { CacheLevel } from "@statsify/api-client";
import { z } from "zod";

export class CacheDto {
  public static schema = z.object({
    cache: z.enum(CacheLevel).default(CacheLevel.CACHE),
  });

  @ApiProperty({
    enum: CacheLevel,
    enumName: "CacheLevel",
    example: CacheLevel.CACHE,
    default: CacheLevel.CACHE,
    description: "Describes whether to return live data or cached data.",
    required: false,
  })
  public cache: CacheLevel;
}
