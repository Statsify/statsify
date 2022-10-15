/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { BedWarsMode, ChallengesBedWars, DreamsBedWarsMode } from "./mode";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import { Progression } from "../../../progression";
import { add, deepSub } from "@statsify/math";
import { getExpReq, getFormattedLevel, getLevel } from "./util";

export const BEDWARS_MODES = new GameModes([
  { api: "overall" },
  { api: "core" },
  { api: "solo", hypixel: "BEDWARS_EIGHT_ONE" },
  { api: "doubles", hypixel: "BEDWARS_EIGHT_TWO" },
  { api: "threes", hypixel: "BEDWARS_FOUR_THREE" },
  { api: "fours", hypixel: "BEDWARS_FOUR_FOUR" },
  { api: "4v4", hypixel: "BEDWARS_TWO_FOUR" },
  { api: "armed" },
  { api: "castle", hypixel: "BEDWARS_CASTLE" },
  { api: "lucky" },
  { api: "rush" },
  { api: "swap" },
  { api: "ultimate" },
  { api: "underworld" },
  { api: "voidless" },

  { hypixel: "BEDWARS_EIGHT_TWO_ARMED", formatted: "Armed Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_ARMED", formatted: "Armed Fours" },
  { hypixel: "BEDWARS_EIGHT_TWO_LUCKY", formatted: "Lucky Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_LUCKY", formatted: "Lucky Fours" },
  { hypixel: "BEDWARS_EIGHT_TWO_RUSH", formatted: "Rush Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_RUSH", formatted: "Rush Fours" },
  { hypixel: "BEDWARS_EIGHT_TWO_SWAP", formatted: "Swap Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_SWAP", formatted: "Swap Fours" },
  { hypixel: "BEDWARS_EIGHT_TWO_ULTIMATE", formatted: "Ultimate Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_ULTIMATE", formatted: "Ultimate Fours" },
  { hypixel: "BEDWARS_EIGHT_TWO_UNDERWORLD", formatted: "Underworld Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_UNDERWORLD", formatted: "Underworld Fours" },
  { hypixel: "BEDWARS_EIGHT_TWO_VOIDLESS", formatted: "Voidless Doubles" },
  { hypixel: "BEDWARS_FOUR_FOUR_VOIDLESS", formatted: "Voidless Fours" },
  { hypixel: "BEDWARS_PRACTICE", formatted: "Practice" },
]);

export type BedWarsModes = IGameModes<typeof BEDWARS_MODES>;

export class BedWars {
  @Field({ historical: { enabled: false } })
  public coins: number;

  @Field({ historical: { enabled: false } })
  public lootChests: number;

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
    historical: { enabled: true, fieldName: "Levels Gained" },
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
  public challenges: ChallengesBedWars;

  public constructor(data: APIData = {}) {
    this.coins = data.coins;
    this.exp = data.Experience || 0;
    this.level = getLevel(this.exp);
    this.levelFormatted = getFormattedLevel(Math.floor(this.level));
    this.nextLevelFormatted = getFormattedLevel(Math.floor(this.level) + 1);

    let exp = this.exp;

    for (let i = 0; i < Math.floor(this.level); i++) {
      exp -= getExpReq(i);
    }

    this.progression = new Progression(exp, getExpReq(Math.floor(this.level)));

    this.lootChests = add(
      data.bedwars_boxes,
      data.bedwars_christmas_boxes,
      data.bedwars_halloween_boxes,
      data.bedwars_lunar_boxes,
      data.bedwars_golden_boxes,
      data.bedwars_easter_boxes
    );

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

    this.core = deepSub(this.overall, this["4v4"]);
    BedWarsMode.applyRatios(this.core);

    this.core.winstreak = this.overall.winstreak;

    this.challenges = new ChallengesBedWars(data);
  }
}

export * from "./mode";
