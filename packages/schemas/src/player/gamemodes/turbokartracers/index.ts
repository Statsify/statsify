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
import { add, ratio } from "@statsify/math";

export const TURBO_KART_RACERS_MODES = new GameModes([{ api: "overall" }]);

export type TurboKartRacersModes = IGameModes<typeof TURBO_KART_RACERS_MODES>;

const prefixes = [
  { color: "8", score: 0 },
  { color: "7", score: 5 },
  { color: "f", score: 25 },
  { color: "3", score: 50 },
  { color: "a", score: 100 },
  { color: "e", score: 200 },
  { color: "b", score: 300 },
  { color: "d", score: 400 },
  { color: "6", score: 500 },
  { color: "2", score: 750 },
  { color: "9", score: 1000 },
  { color: "5", score: 2500 },
  { color: "4", score: 5000 },
  { color: "8", score: 10_000 },
];

export class TurboKartRacers {
  @Field()
  public coins: number;

  @Field()
  public tokens: number;

  @Field({ leaderboard: { enabled: false } })
  public grandPrixTokens: number;

  @Field()
  public lapsCompleted: number;

  @Field({ leaderboard: { enabled: false } })
  public boxesPickedUp: number;

  @Field({ leaderboard: { enabled: false } })
  public coinsPickedUp: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public gold: number;

  @Field()
  public silver: number;

  @Field()
  public bronze: number;

  @Field()
  public total: number;

  @Field({ leaderboard: { enabled: false } })
  public trophyRate: number;

  @Field({ leaderboard: { enabled: false } })
  public goldRate: number;

  @Field()
  public progression: Progression;

  @Field()
  public currentPrefix: string;

  @Field()
  public nextPrefix: string;

  public constructor(data: APIData, legacy: APIData) {
    this.coins = data.coins;
    this.tokens = legacy.tokens;
    this.gamesPlayed = add(
      data.retro_plays,
      data.olympus_plays,
      data.canyon_plays,
      data.hypixelgp_plays,
      data.junglerush_plays
    );

    this.grandPrixTokens = data.grand_prix_tokens;
    this.lapsCompleted = data.laps_completed;
    this.boxesPickedUp = data.box_pickups;
    this.coinsPickedUp = data.coins_picked_up;

    this.bronze = data.bronze_trophy;
    this.silver = data.silver_trophy;
    this.gold = data.gold_trophy;
    this.total = add(this.gold, this.silver, this.bronze);

    this.currentPrefix = getFormattedLevel(prefixes, this.gold);
    this.nextPrefix = getFormattedLevel(prefixes, this.gold, true);
    this.progression = new Progression(
      Math.abs(this.gold - getPrefixRequirement(prefixes, this.gold)),
      getPrefixRequirement(prefixes, this.gold, 1) -
        getPrefixRequirement(prefixes, this.gold)
    );

    this.goldRate = ratio(this.gold, this.gamesPlayed, 100);
    this.trophyRate = ratio(this.total, this.gamesPlayed, 100);
  }
}
