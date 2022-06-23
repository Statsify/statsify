/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Color, ColorCode } from "../../../color";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import { Progression } from "../../../progression";
import { WoolWarsClass, WoolWarsOverall } from "./class";
import { getExpReq, getFormattedLevel, getLevel } from "./util";

export const WOOLWARS_MODES = new GameModes([
  { api: "overall" },
  { api: "tank" },
  { api: "archer" },
  { api: "builder" },
  { api: "swordsman" },
  { api: "engineer" },
  { api: "golem" },
  { api: "assault" },
]);

export type WoolWarsModes = IGameModes<typeof WOOLWARS_MODES>;

export class WoolWars {
  @Field()
  public coins: number;

  @Field({ leaderboard: { enabled: false } })
  public layers: number;

  @Field({
    leaderboard: {
      fieldName: "Level",
      hidden: true,
      additionalFields: [
        "stats.woolwars.overall.wins",
        "stats.woolwars.overall.kills",
        "stats.woolwars.overall.kdr",
      ],
    },
  })
  public exp: number;

  @Field({ leaderboard: { enabled: false } })
  public level: number;

  @Field()
  public levelFormatted: string;

  @Field()
  public levelColor: Color;

  @Field()
  public progression: Progression;

  @Field()
  public nextLevelFormatted: string;

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

  public constructor(data: APIData) {
    this.coins = data.coins;
    this.layers = data.progression?.available_layers;
    this.exp = Math.round(data.progression?.experience ?? 0);

    this.level = getLevel(this.exp);
    this.levelFormatted = getFormattedLevel(this.level);
    this.nextLevelFormatted = getFormattedLevel(this.level + 1);

    this.levelColor =
      this.levelFormatted[1] === "7" && this.level > 1000
        ? new Color(`§${this.levelFormatted[4]}` as ColorCode)
        : new Color(`§${this.levelFormatted[1]}` as ColorCode);

    let exp = this.exp;

    for (let i = 0; i < this.level; i++) {
      exp -= getExpReq(i);
    }

    this.progression = new Progression(exp, getExpReq(this.level));

    this.overall = new WoolWarsOverall(data.wool_wars?.stats);

    this.tank = new WoolWarsClass(data.wool_wars?.stats?.classes?.tank);
    this.archer = new WoolWarsClass(data.wool_wars?.stats?.classes?.archer);
    this.builder = new WoolWarsClass(data.wool_wars?.stats?.classes?.builder);
    this.swordsman = new WoolWarsClass(data.wool_wars?.stats?.classes?.swordsman);
    this.engineer = new WoolWarsClass(data.wool_wars?.stats?.classes?.engineer);
    this.golem = new WoolWarsClass(data.wool_wars?.stats?.classes?.golem);
    this.assault = new WoolWarsClass(data.wool_wars?.stats?.classes?.assult);
  }
}

export * from "./class";
