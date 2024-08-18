/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData } from "@statsify/util";
import { Field } from "#metadata";
import { ratio } from "@statsify/math";

export class SheepWars {
  @Field()
  public gamesPlayed: number;

  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public sheepThrown: number;

  @Field()
  public magicWool: number;

  @Field({ store: { default: "none" } })
  public kit: string;

  public constructor(data: APIData = {}) {
    this.gamesPlayed = data.stats?.games_played;
    this.wins = data.stats?.wins;
    this.losses = data.stats?.losses;
    this.wlr = ratio(this.wins, this.losses);

    this.kills = data.stats?.kills;
    this.deaths = data.stats?.deaths;
    this.kdr = ratio(this.kills, this.deaths);

    this.sheepThrown = data.stats?.sheep_thrown;
    this.magicWool = data.stats?.magic_wool_hit;

    this.kit = data.default_kit;
  }
}
