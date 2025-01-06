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
  public explosiveKills: number;

  @Field()
  public voidKills: number;

  @Field()
  public bowKills: number;

  @Field()
  public meleeKills: number;

  @Field()
  public sheepThrown: number;

  @Field()
  public sheepKilled: number;

  @Field()
  public magicWool: number;

  @Field({ store: { default: "none" } })
  public kit: string;

  public constructor(data: APIData = {}, ap: APIData = {}) {
    this.gamesPlayed = data.stats?.games_played;
    this.wins = data.stats?.wins;
    this.losses = data.stats?.losses;
    this.wlr = ratio(this.wins, this.losses);

    this.kills = data.stats?.kills;
    this.deaths = data.stats?.deaths;
    this.kdr = ratio(this.kills, this.deaths);

    this.explosiveKills = data.stats?.kills_explosive;
    this.voidKills = data.stats?.kills_void;
    this.bowKills = data.stats?.kills_bow;
    this.meleeKills = data.stats?.kills_melee;

    this.sheepThrown = data.stats?.sheep_thrown;
    this.sheepKilled = ap?.woolgames_sheep_wars_sheep_slayer;
    this.magicWool = data.stats?.magic_wool_hit;

    this.kit = data.default_kit;
  }
}
