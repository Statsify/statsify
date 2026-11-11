/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class UpdatePlayerDto extends createZodDto(
  // The rest of the Hypixel player passes through to `new Player()`
  z.looseObject({
    uuid: z.string(),
    playername: z.string(),
    displayname: z.string(),
  })
) {}
