/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { Player } from "@statsify/schemas";
import { SuccessResponse } from "./success.response.js";

export const HYPIXEL_UNAVAILABLE_PROPERTY = {
  required: false,
  description: "True when Hypixel failed or rate limited Statsify, so cached data was returned instead",
};

export class GetPlayerResponse extends SuccessResponse {
  @ApiProperty()
  public player: Player;

  @ApiProperty(HYPIXEL_UNAVAILABLE_PROPERTY)
  public hypixelUnavailable?: boolean;
}
