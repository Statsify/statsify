/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { add, ratio } from "@statsify/math";

export const TURBO_KART_RACERS_MODES = ["overall"] as const;
export type TurboKartRacersModes = typeof TURBO_KART_RACERS_MODES;

export class TurboKartRacers {
  @Field()
  public coins: number;

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

  public constructor(data: APIData) {
    this.coins = data.coins;
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

    this.goldRate = ratio(this.gold, this.gamesPlayed, 100);
    this.trophyRate = ratio(this.total, this.gamesPlayed, 100);
  }
}
