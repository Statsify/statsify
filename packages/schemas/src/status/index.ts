/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { Game } from "#game";
import { PlayerStatus } from "#player";
import { RecentGame } from "./recent-game.js";
import type { APIData } from "@statsify/util";

export class Status {
  @Field()
  public uuid: string;

  @Field()
  public displayName: string;

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

  @Field()
  public recentGames: RecentGame[];

  public constructor(data: APIData) {
    this.online = data.online;
    this.game = new Game(data.gameType ?? "LIMBO");
    this.mode = data.mode;
    this.map = data.map;
    this.recentGames = [];
  }
}

export * from "./recent-game.js";
