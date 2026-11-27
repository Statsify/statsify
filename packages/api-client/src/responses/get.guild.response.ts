/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { Guild } from "@statsify/schemas";
import { HYPIXEL_UNAVAILABLE_PROPERTY } from "./get.player.response.js";
import { SuccessResponse } from "./success.response.js";

export class GetGuildResponse extends SuccessResponse {
  @ApiProperty()
  public guild: Guild;

  @ApiProperty(HYPIXEL_UNAVAILABLE_PROPERTY)
  public hypixelUnavailable?: boolean;
}
