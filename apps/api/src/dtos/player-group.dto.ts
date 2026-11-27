/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class PlayerGroupDto extends createZodDto(
  z.object({
    start: z.coerce.number().min(0),
    end: z.coerce.number(),
  })
) {}
