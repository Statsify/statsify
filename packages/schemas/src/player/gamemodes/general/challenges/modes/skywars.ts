/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, removeFormatting } from "@statsify/util";
import { Field } from "../../../../../metadata";
import { FormattedGame } from "../../../../../game";
import { add } from "@statsify/math";
import { challengeFieldData } from "../util";
import type { GameChallenges } from "../game-challenges";

export class SkyWarsChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public feedingTheVoid: number;

  @Field(challengeFieldData)
  public rush: number;

  @Field(challengeFieldData)
  public ranked: number;

  @Field(challengeFieldData)
  public enderman: number;

  @Field({
    leaderboard: {
      fieldName: `${removeFormatting(FormattedGame.SKYWARS)} Total`,
      name: "Total",
    },
  })
  public total: number;

  public constructor(challenges: APIData) {
    this.feedingTheVoid = challenges.SKYWARS__feeding_the_void_challenge;
    this.rush = challenges.SKYWARS__rush_challenge;
    this.ranked = challenges.SKYWARS__ranked_challenge;
    this.enderman = challenges.SKYWARS__enderman_challenge;

    this.total = add(this.feedingTheVoid, this.rush, this.ranked, this.enderman);
  }
}
