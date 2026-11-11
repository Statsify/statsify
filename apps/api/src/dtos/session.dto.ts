/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PlayerDto } from "./player.dto.js";
import { z } from "zod";

export class SessionDto extends PlayerDto {
  public static override schema = PlayerDto.schema.extend({ userUuid: z.string().optional() });

  public userUuid?: string;
}
