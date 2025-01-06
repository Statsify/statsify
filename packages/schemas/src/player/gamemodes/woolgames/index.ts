/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, formatTime } from "@statsify/util";
import { CaptureTheWool } from "./capture-the-wool.js";
import { type ExtractGameModes, GameModes } from "#game";
import { Field } from "#metadata";
import { Progression } from "#progression";
import { SheepWars } from "./sheepwars.js";
import { WoolWars } from "./woolwars.js";
import { add } from "@statsify/math";
import { getExpReq, getFormattedLevel, getLevel } from "./util.js";

export const WOOLGAMES_MODES = new GameModes([
  {
    api: "woolwars",
    formatted: "Wool Wars",
    hypixel: "wool_wars_two_four",
    submodes: [
      { api: "overall" },
      { api: "tank" },
      { api: "archer" },
      { api: "builder" },
      { api: "swordsman" },
      { api: "engineer" },
      { api: "golem" },
      { api: "assault" },
    ],
  },
  { api: "sheepwars", formatted: "Sheep Wars", hypixel: "sheep_wars_two_six" },
  { api: "captureTheWool", hypixel: "capture_the_wool_two_twenty" },
] as const);

export type WoolGamesModes = ExtractGameModes<typeof WOOLGAMES_MODES>;

export class WoolGames {
  @Field({ historical: { enabled: false } })
  public coins: number;

  @Field({ leaderboard: { enabled: false } })
  public layers: number;

  @Field({
    leaderboard: {
      fieldName: "Level",
      hidden: true,
      formatter: (exp: number) => getFormattedLevel(Math.floor(getLevel(exp))),
      additionalFields: ["this.wins", "this.playtime"],
    },
    historical: {
      hidden: false,
      fieldName: "EXP Gained",
      formatter: Number,
      additionalFields: ["this.level"],
    },
  })
  public exp: number;

  @Field({ leaderboard: { enabled: false }, historical: { fieldName: "Levels Gained" } })
  public level: number;

  @Field()
  public levelFormatted: string;

  @Field()
  public progression: Progression;

  @Field()
  public nextLevelFormatted: string;

  @Field({ leaderboard: { formatter: formatTime }, historical: { enabled: false } })
  public playtime: number;

  @Field()
  public wins: number;

  @Field({ leaderboard: { name: "WoolWars" } })
  public woolwars: WoolWars;

  @Field({ leaderboard: { name: "SheepWars" } })
  public sheepwars: SheepWars;

  @Field()
  public captureTheWool: CaptureTheWool;

  public constructor(data: APIData, ap: APIData) {
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

    this.playtime = (data.playtime ?? 0) * 1000;

    this.woolwars = new WoolWars(data.wool_wars);
    this.sheepwars = new SheepWars(data.sheep_wars, ap);
    this.captureTheWool = new CaptureTheWool(data.capture_the_wool?.stats);
    this.wins = add(this.woolwars.overall.wins, this.sheepwars.wins, this.captureTheWool.wins);
  }
}

export * from "./woolwars.js";
export * from "./sheepwars.js";
export * from "./capture-the-wool.js";
