/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { NotFoundException } from "./base.404.js";
import { Player } from "@statsify/schemas";

export class RecentGamesNotFoundException extends NotFoundException {
  @ApiProperty()
  public uuid: string;

  @ApiProperty()
  public displayName: string;

  @ApiProperty()
  public prefixName: string;

  public constructor(player: Player) {
    super({
      message: "recentGames",
      uuid: player.uuid,
      displayName: player.displayName,
      prefixName: player.prefixName,
    });
  }
}
