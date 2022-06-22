/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../metadata";
import { Game } from "../game";
import { PlayerStatus } from "../player/status";

export class Status {
  @Field()
  public uuid: string;

  @Field()
  public prefixName: string;

  @Field()
  public actions: PlayerStatus;

  @Field()
  public online: boolean;

  @Field()
  public game: Game;

  @Field({ store: { required: false } })
  public mode?: string;

  @Field({ store: { required: false } })
  public map?: string;

  public constructor(data: APIData) {
    this.online = data.online;
    this.game = new Game(data.gameType ?? "LIMBO");
    this.mode = data.mode;
    this.map = data.map;
  }
}
