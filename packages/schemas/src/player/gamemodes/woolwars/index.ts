/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { GameModes } from "../../../game";
import {
  GameType,
  GetMetadataModes,
  Mode,
  StatsifyApiModes,
} from "../../../metadata/GameType";
import { Progression } from "../../../progression";
import { WoolWarsClass, WoolWarsOverall } from "./class";
import { getExpReq, getFormattedLevel, getLevel } from "./util";

@GameType()
export class WoolWars {
  @Field()
  public coins: number;

  @Field({ leaderboard: { enabled: false } })
  public layers: number;

  @Field({
    leaderboard: {
      fieldName: "Level",
      hidden: true,
      formatter: (exp: number) => getFormattedLevel(Math.floor(getLevel(exp))),
      additionalFields: ["this.overall.wins", "this.overall.kills", "this.overall.kdr"],
    },
  })
  public exp: number;

  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field()
  public levelFormatted: string;

  @Field()
  public progression: Progression;

  @Field()
  public nextLevelFormatted: string;

  @Mode()
  @Field()
  public overall: WoolWarsOverall;

  @Mode()
  @Field()
  public tank: WoolWarsClass;

  @Mode()
  @Field()
  public archer: WoolWarsClass;

  @Mode()
  @Field()
  public builder: WoolWarsClass;

  @Mode()
  @Field()
  public swordsman: WoolWarsClass;

  @Mode()
  @Field()
  public engineer: WoolWarsClass;

  @Mode()
  @Field()
  public golem: WoolWarsClass;

  @Mode()
  @Field()
  public assault: WoolWarsClass;

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.layers = data.progression?.available_layers;
    this.exp = Math.round(data.progression?.experience ?? 0);

    this.level = getLevel(this.exp);
    this.levelFormatted = getFormattedLevel(Math.floor(this.level));
    this.nextLevelFormatted = getFormattedLevel(Math.floor(this.level) + 1);

    let exp = this.exp;

    for (let i = 0; i < Math.floor(this.level); i++) {
      exp -= getExpReq(i);
    }

    this.progression = new Progression(exp, getExpReq(Math.floor(this.level)));

    this.overall = new WoolWarsOverall(data.wool_wars?.stats);

    this.tank = new WoolWarsClass(data.wool_wars?.stats?.classes?.tank);
    this.archer = new WoolWarsClass(data.wool_wars?.stats?.classes?.archer);
    this.builder = new WoolWarsClass(data.wool_wars?.stats?.classes?.builder);
    this.swordsman = new WoolWarsClass(data.wool_wars?.stats?.classes?.swordsman);
    this.engineer = new WoolWarsClass(data.wool_wars?.stats?.classes?.engineer);
    this.golem = new WoolWarsClass(data.wool_wars?.stats?.classes?.golem);
    this.assault = new WoolWarsClass(data.wool_wars?.stats?.classes?.assault);
  }
}

export type WoolWarsModes = StatsifyApiModes<WoolWars>;
export const WOOLWARS_MODES = new GameModes<WoolWarsModes>(GetMetadataModes(WoolWars));

export * from "./class";
