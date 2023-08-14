/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { IsBoolean } from "class-validator";
import { PlayerDto } from "./player.dto.js";
import { Transform } from "class-transformer";

export class SessionDto extends PlayerDto {

  @Transform((params) => params.value === "true")
  @IsBoolean()
  public upsert: boolean;
}
