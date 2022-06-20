/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from '@nestjs/swagger';
import { Player, PlayerStatus } from '@statsify/schemas';
import { NotFoundException } from './base.404';

export class StatusNotFoundException extends NotFoundException {
  @ApiProperty()
  public uuid: string;

  @ApiProperty()
  public displayName: string;

  @ApiProperty()
  public actions: PlayerStatus;

  public constructor(player: Player) {
    super('status');

    this.uuid = player.uuid;
    this.displayName = player.displayName;
    this.actions = player.status;
  }
}
