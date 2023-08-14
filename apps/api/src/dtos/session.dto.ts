/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { IsOptional, IsString } from "class-validator";
import { PlayerDto } from "./player.dto.js";

export class SessionDto extends PlayerDto {

  @IsOptional()
  @IsString()
  public userUuid?: string;
}
