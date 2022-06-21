/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { Player } from "@statsify/schemas";
import { SuccessResponse } from "./success.response";

export class GetPlayerResponse extends SuccessResponse {
  @ApiProperty()
  public player: Player;
}
