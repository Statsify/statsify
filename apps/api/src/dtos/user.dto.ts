/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class UserIdDto extends createZodDto(
  z.object({ id: z.string().min(17).max(20).describe("Discord ID") })
) {}

export class UserDto extends createZodDto(
  z.object({ tag: z.string().min(17).max(36).describe("Discord ID or UUID") })
) {}

export class UpdateUserDto extends createZodDto(
  z
    .looseObject({
      serverMember: z.boolean().nullish(),
      theme: z.object({
        font: z.string().nullish(),
        palette: z.string().nullish(),
        boxes: z.string().nullish(),
      }).optional(),
      footer: z.object({
        message: z.string().nullish(),
        icon: z.number().nullish(),
      }).optional(),
      locale: z.string().nullish(),
    })
    // Nest's ValidationPipe read a missing body as `{}`, which this DTO accepts
    .default({})
) {}
