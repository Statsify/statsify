/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BedWarsMode, ChallengesBedWars, DreamsBedWarsMode } from "./mode.js";
import { type ExtractGameModes, GameModes } from "#game";
import { Field } from "#metadata";
import { Progression } from "#progression";
import { Slumber } from "./slumber.js";
import { deepSub } from "@statsify/math";
import { getExpReq, getFormattedLevel, getLevel } from "./util.js";
import type { APIData } from "@statsify/util";

export const BEDWARS_MODES = new GameModes([
  { api: "overall" },
  { api: "core" },
  { api: "solo", hypixel: "BEDWARS_EIGHT_ONE" },
  { api: "doubles", hypixel: "BEDWARS_EIGHT_TWO" },
  { api: "threes", hypixel: "BEDWARS_FOUR_THREE" },
  { api: "fours", hypixel: "BEDWARS_FOUR_FOUR" },
  { api: "4v4", hypixel: "BEDWARS_TWO_FOUR" },
  {
    api: "armed",
    submodes: [
      { api: "armed", formatted: "Overall" },
      { api: "armedDoubles", formatted: "Doubles" },
      { api: "armedFours", formatted: "Fours" },
    ],
  },
  { api: "castle", hypixel: "BEDWARS_CASTLE" },
  {
    api: "lucky",
    submodes: [
      { api: "lucky", formatted: "Overall" },
      { api: "luckyDoubles", formatted: "Doubles" },
      { api: "luckyFours", formatted: "Fours" },
    ],
  },
  {
    api: "rush",
    submodes: [
      { api: "rush", formatted: "Overall" },
      { api: "rushDoubles", formatted: "Doubles" },
      { api: "rushFours", formatted: "Fours" },
    ],
  },
  {
    api: "swap",
    submodes: [
      { api: "swap", formatted: "Overall" },
      { api: "swapDoubles", formatted: "Doubles" },
      { api: "swapFours", formatted: "Fours" },
    ],
  },
  {
    api: "ultimate",
    submodes: [
      { api: "ultimate", formatted: "Overall" },
      { api: "ultimateDoubles", formatted: "Doubles" },
      { api: "ultimateFours", formatted: "Fours" },
    ],
  },
  {
    api: "underworld",
    submodes: [
      { api: "underworld", formatted: "Overall" },
      { api: "underworldDoubles", formatted: "Doubles" },
      { api: "underworldFours", formatted: "Fours" },
    ],
  },
  {
    api: "voidless",
    submodes: [
      { api: "voidless", formatted: "Overall" },
      { api: "voidlessDoubles", formatted: "Doubles" },
      { api: "voidlessFours", formatted: "Fours" },
    ],
  },
  { api: "oneBlock", hypixel: "BEDWARS_EIGHT_ONE_ONEBLOCK" },
  { hypixel: "BEDWARS_PRACTICE", formatted: "Practice" },
] as const);

export type BedWarsModes = ExtractGameModes<typeof BEDWARS_MODES>;

export class BedWars {
  @Field({ historical: { enabled: false } })
  public tokens: number;

  @Field({
    leaderboard: {
      fieldName: "Level",
      hidden: true,
      formatter: (exp: number) => getFormattedLevel(Math.floor(getLevel(exp))),
      additionalFields: [
        "this.overall.wins",
        "this.overall.finalKills",
        "this.overall.fkdr",
      ],
    },
    historical: {
      hidden: false,
      fieldName: "EXP Gained",
      additionalFields: ["this.level"],
      formatter: Number,
    },
  })
  public exp: number;

  @Field({
    leaderboard: { enabled: false },
    historical: { enabled: false, fieldName: "Levels Gained" },
  })
  public level: number;

  @Field()
  public levelFormatted: string;

  @Field()
  public progression: Progression;

  @Field()
  public nextLevelFormatted: string;

  @Field()
  public overall: BedWarsMode;

  @Field()
  public solo: BedWarsMode;

  @Field()
  public doubles: BedWarsMode;

  @Field()
  public threes: BedWarsMode;

  @Field()
  public fours: BedWarsMode;

  @Field()
  public core: BedWarsMode;

  @Field()
  public "4v4": BedWarsMode;

  @Field()
  public armed: BedWarsMode;

  @Field()
  public castle: BedWarsMode;

  @Field()
  public lucky: BedWarsMode;

  @Field()
  public rush: BedWarsMode;

  @Field()
  public swap: BedWarsMode;

  @Field()
  public ultimate: BedWarsMode;

  @Field()
  public underworld: BedWarsMode;

  @Field()
  public voidless: BedWarsMode;

  @Field()
  public oneBlock: BedWarsMode;

  @Field()
  public armedDoubles: BedWarsMode;

  @Field()
  public armedFours: BedWarsMode;

  @Field()
  public luckyDoubles: BedWarsMode;

  @Field()
  public luckyFours: BedWarsMode;

  @Field()
  public rushDoubles: BedWarsMode;

  @Field()
  public rushFours: BedWarsMode;

  @Field()
  public swapDoubles: BedWarsMode;

  @Field()
  public swapFours: BedWarsMode;

  @Field()
  public ultimateDoubles: BedWarsMode;

  @Field()
  public ultimateFours: BedWarsMode;

  @Field()
  public underworldDoubles: BedWarsMode;

  @Field()
  public underworldFours: BedWarsMode;

  @Field()
  public voidlessDoubles: BedWarsMode;

  @Field()
  public voidlessFours: BedWarsMode;

  @Field()
  public challenges: ChallengesBedWars;

  @Field({ leaderboard: { fieldName: "" } })
  public slumber: Slumber;

  public constructor(data: APIData = {}) {
    this.tokens = data.coins;

    this.exp = data.Experience || 0;
    this.level = getLevel(this.exp);
    this.levelFormatted = getFormattedLevel(Math.floor(this.level));
    this.nextLevelFormatted = getFormattedLevel(Math.floor(this.level) + 1);

    let exp = this.exp;

    for (let i = 0; i < Math.floor(this.level); i++) {
      exp -= getExpReq(i);
    }

    this.progression = new Progression(exp, getExpReq(Math.floor(this.level)));

    this.overall = new BedWarsMode(data, "");
    this.solo = new BedWarsMode(data, "eight_one");
    this.doubles = new BedWarsMode(data, "eight_two");
    this.threes = new BedWarsMode(data, "four_three");
    this.fours = new BedWarsMode(data, "four_four");
    this["4v4"] = new BedWarsMode(data, "two_four");

    this.castle = new BedWarsMode(data, "castle");

    this.armed = DreamsBedWarsMode.new(data, "armed");
    this.lucky = DreamsBedWarsMode.new(data, "lucky");
    this.rush = DreamsBedWarsMode.new(data, "rush");
    this.swap = DreamsBedWarsMode.new(data, "swap");
    this.ultimate = DreamsBedWarsMode.new(data, "ultimate");
    this.underworld = DreamsBedWarsMode.new(data, "underworld");
    this.voidless = DreamsBedWarsMode.new(data, "voidless");
    this.oneBlock = new BedWarsMode(data, "eight_one_oneblock");

    this.armedDoubles = new BedWarsMode(data, "eight_two_armed");
    this.armedFours = new BedWarsMode(data, "four_four_armed");
    this.luckyDoubles = new BedWarsMode(data, "eight_two_lucky");
    this.luckyFours = new BedWarsMode(data, "four_four_lucky");
    this.rushDoubles = new BedWarsMode(data, "eight_two_rush");
    this.rushFours = new BedWarsMode(data, "four_four_rush");
    this.swapDoubles = new BedWarsMode(data, "eight_two_swap");
    this.swapFours = new BedWarsMode(data, "four_four_swap");
    this.ultimateDoubles = new BedWarsMode(data, "eight_two_ultimate");
    this.ultimateFours = new BedWarsMode(data, "four_four_ultimate");
    this.underworldDoubles = new BedWarsMode(data, "eight_two_underworld");
    this.underworldFours = new BedWarsMode(data, "four_four_underworld");
    this.voidlessDoubles = new BedWarsMode(data, "eight_two_voidless");
    this.voidlessFours = new BedWarsMode(data, "four_four_voidless");

    this.core = deepSub(this.overall, this["4v4"]);
    BedWarsMode.applyRatios(this.core);

    this.core.winstreak = this.overall.winstreak;

    this.challenges = new ChallengesBedWars(data);
    this.slumber = new Slumber(data.slumber);
  }
}

export * from "./mode.js";
export * from "./slumber.js";
