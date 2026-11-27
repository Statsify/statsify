/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { UuidDto } from "./uuid.dto.js";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class HeadDto extends createZodDto(
  UuidDto.schema.extend({
    size: z.coerce.number().int().min(8).max(800).default(160).describe("The size of the head"),
  })
) {}
