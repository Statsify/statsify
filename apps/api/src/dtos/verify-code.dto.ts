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

export class VerifyCodeDto extends createZodDto(
  z.object({
    uuid: UuidDto.schema.shape.uuid.optional(),
    id: z.string().min(17).describe("Discord ID"),
    code: z.string().length(4).optional().describe("Verification Code"),
  })
) {}
