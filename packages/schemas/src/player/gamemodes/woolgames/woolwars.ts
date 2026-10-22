/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { ratio, sub } from "@statsify/math";
import type { APIData } from "@statsify/util";

export class WoolWarsClass {
  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  @Field({ leaderboard: { name: "Power-Ups" } })
  public powerups: number;

  @Field({ leaderboard: { additionalFields: ["this.woolPlaced"] } })
  public blocksBroken: number;

  @Field({ leaderboard: { additionalFields: ["this.blocksBroken"] } })
  public woolPlaced: number;

  @Field()
  public wins: number;

  @Field()
  public gamesPlayed: number;

  public constructor(data: APIData = {}) {
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);
    this.assists = data.assists;

    this.powerups = data.powerups_gotten;
    this.blocksBroken = data.blocks_broken;
    this.woolPlaced = data.wool_placed;

    this.wins = data.wins;
    this.gamesPlayed = data.games_played;
  }
}

export class WoolWarsOverall extends WoolWarsClass {
  // Redecorated so Overall gets its own metadata: the scanner adds losses and wlr to
  // wins' leaderboard additionalFields, which would otherwise leak onto every class
  @Field()
  public declare wins: number;

  @Field()
  public declare gamesPlayed: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  public constructor(data: APIData = {}) {
    super(data);

    this.losses = sub(this.gamesPlayed, this.wins);
    this.wlr = ratio(this.wins, this.losses);
  }
}

export class WoolWars {
  @Field()
  public overall: WoolWarsOverall;

  @Field()
  public tank: WoolWarsClass;

  @Field()
  public archer: WoolWarsClass;

  @Field()
  public builder: WoolWarsClass;

  @Field()
  public swordsman: WoolWarsClass;

  @Field()
  public engineer: WoolWarsClass;

  @Field()
  public golem: WoolWarsClass;

  @Field()
  public assault: WoolWarsClass;

  @Field({ store: { default: "none" } })
  public class: string;

  public constructor(data: APIData = {}) {
    this.overall = new WoolWarsOverall(data.stats);
    this.tank = new WoolWarsClass(data.stats?.classes?.tank);
    this.archer = new WoolWarsClass(data.stats?.classes?.archer);
    this.builder = new WoolWarsClass(data.stats?.classes?.builder);
    this.swordsman = new WoolWarsClass(data.stats?.classes?.swordsman);
    this.engineer = new WoolWarsClass(data.stats?.classes?.engineer);
    this.golem = new WoolWarsClass(data.stats?.classes?.golem);
    this.assault = new WoolWarsClass(data.stats?.classes?.assault);
    this.class = data.selected_class;
  }
}
