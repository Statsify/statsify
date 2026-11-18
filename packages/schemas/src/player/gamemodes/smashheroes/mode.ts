/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { ratio } from "@statsify/math";
import type { APIData } from "@statsify/util";

export class SmashHeroesMode {
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
  public gamesPlayed: number;

  @Field()
  public damageDealt: number;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.losses = data[`losses${mode}`];
    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.gamesPlayed = data[`games${mode}`];
    this.damageDealt = data[`damage_dealt${mode}`];

    this.wlr = ratio(this.wins, this.losses);
    this.kdr = ratio(this.kills, this.deaths);
  }
}

export class SmashHeroesKit {
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
  public gamesPlayed: number;

  @Field()
  public damageDealt: number;

  public constructor(kit: string, data: APIData = {}) {
    this.wins = data[kit]?.wins;
    this.losses = data[kit]?.losses;
    this.kills = data[kit]?.kills;
    this.deaths = data[kit]?.deaths;
    this.gamesPlayed = data[kit]?.games;
    this.damageDealt = data[kit]?.damage_dealt;

    this.wlr = ratio(this.wins, this.losses);
    this.kdr = ratio(this.kills, this.deaths);
  }
}
