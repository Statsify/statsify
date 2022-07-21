/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, getFormattedLevel, getPrefixRequirement } from "@statsify/util";
import { Field } from "../../../metadata";
import { GameModes, IGameModes } from "../../../game";
import { Progression } from "../../../progression";
import { QuakeMode } from "./mode";
import { deepAdd } from "@statsify/math";

export const QUAKE_MODES = new GameModes([
  { api: "overall" },
  { api: "solo", hypixel: "solo" },
  { api: "teams", hypixel: "teams" },
]);

export type QuakeModes = IGameModes<typeof QUAKE_MODES>;

const indexes = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

const prefixes = [
  { color: "8", score: 0 },
  { color: "7", score: 25_000 },
  { color: "f", score: 50_000 },
  { color: "2", score: 75_000 },
  { color: "e", score: 100_000 },
  { color: "a", score: 200_000 },
  { color: "9", score: 300_000 },
  { color: "3", score: 400_000 },
  { color: "d", score: 500_000 },
  { color: "5", score: 600_000 },
  { color: "c", score: 750_000 },
  { color: "6", score: 1_000_000 },
  { color: "0", score: 2_000_000 },
];

export class Quake {
  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field()
  public nextPrefix: string;

  @Field()
  public overall: QuakeMode;

  @Field()
  public solo: QuakeMode;

  @Field()
  public teams: QuakeMode;

  @Field()
  public coins: number;

  @Field()
  public highestKillstreak: number;

  @Field()
  public godlikes: number;

  @Field()
  public tokens: number;

  @Field({ leaderboard: { enabled: false }, store: { default: 1.3 } })
  public trigger: number;

  public constructor(data: APIData, ap: APIData, legacy: APIData) {
    this.solo = new QuakeMode(data, "");
    this.teams = new QuakeMode(data, "teams");

    this.overall = deepAdd(this.solo, this.teams);

    this.currentPrefix = getFormattedLevel(prefixes, this.overall.kills);
    this.nextPrefix = getFormattedLevel(prefixes, this.overall.kills, true);

    this.progression = new Progression(
      Math.abs(this.overall.kills - getPrefixRequirement(prefixes, this.overall.kills)),
      getPrefixRequirement(prefixes, this.overall.kills, 1) -
        getPrefixRequirement(prefixes, this.overall.kills)
    );

    QuakeMode.applyRatios(this.overall);

    this.coins = data.coins;
    this.highestKillstreak = data.highest_killstreak;
    this.godlikes = ap.quake_godlikes;
    this.tokens = legacy.quakecraft_tokens;

    // NINE_POINT_ZERO becomes 9.0
    // ALWAYS in seconds
    this.trigger =
      +data.trigger
        ?.toLowerCase()
        .split("_")
        // Converts string numbers to actually number && remove the 'point'
        .map((trigger: string) =>
          indexes.includes(trigger) ? indexes.indexOf(trigger) : "."
        )
        .join("") || 1.3;
  }
}

export * from "./mode";
