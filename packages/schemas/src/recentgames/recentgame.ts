/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from '@statsify/util';
import { Game } from '../game';
import { Field } from '../metadata';

export class RecentGame {
  @Field({ store: { store: false } })
  public startedAt: number;

  @Field()
  public game: Game;

  @Field({ store: { required: false } })
  public mode?: string;

  @Field({ store: { required: false } })
  public map?: string;

  @Field({ store: { required: false } })
  public endedAt?: number;

  @Field({ store: { required: false } })
  public gameLength?: number;

  public constructor(data: APIData = {}) {
    this.startedAt = data.date;
    this.game = new Game(data.gameType);
    this.mode = data.mode;
    this.map = data.map;
    this.endedAt = data.ended;

    if (this.endedAt) {
      this.gameLength = this.endedAt - this.startedAt;
    }
  }
}
