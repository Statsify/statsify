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
import { GameModes } from "../../../game";
import {
  GameType,
  GetMetadataModes,
  Mode,
  StatsifyApiModes,
} from "../../../metadata/GameType";
import { Progression } from "../../../progression";
import { add, deepSub } from "@statsify/math";
import { getExpReq, getFormattedLevel, getLevel } from "./util";

@GameType()
export class BedWars {
  @Field()
  public coins: number;

  @Field()
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
  public overall: BedWarsMode;

  @Mode()
  @Field()
  public core: BedWarsMode;

  @Mode("BEDWARS_EIGHT_ONE")
  @Field()
  public solo: BedWarsMode;

  @Mode("BEDWARS_EIGHT_TWO")
  @Field()
  public doubles: BedWarsMode;

  @Mode("BEDWARS_FOUR_THREE")
  @Field()
  public threes: BedWarsMode;

  @Mode("BEDWARS_FOUR_FOUR")
  @Field()
  public fours: BedWarsMode;

  @Mode("BEDWARS_TWO_FOUR")
  @Field()
  public "4v4": BedWarsMode;

  @Mode()
  @Field()
  public armed: BedWarsMode;

  @Mode("BEDWARS_CASTLE")
  @Field()
  public castle: BedWarsMode;

  @Mode()
  @Field()
  public lucky: BedWarsMode;

  @Mode()
  @Field()
  public rush: BedWarsMode;

  @Mode()
  @Field()
  public swap: BedWarsMode;

  @Mode()
  @Field()
  public ultimate: BedWarsMode;

  @Mode()
  @Field()
  public underworld: BedWarsMode;

  @Mode()
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

export type BedWarsModes = StatsifyApiModes<BedWars>;
export const BEDWARS_MODES = new GameModes<BedWarsModes>([
  ...GetMetadataModes(BedWars),
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

export * from "./mode";
