/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CacheLevel } from "@statsify/api-client";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class CacheDto extends createZodDto(
  z.object({
    cache: z
      .enum(CacheLevel)
      .meta({ id: "CacheLevel" })
      .default(CacheLevel.CACHE)
      .meta({
        example: CacheLevel.CACHE,
        description: "Describes whether to return live data or cached data.",
      }),
  })
) {}
