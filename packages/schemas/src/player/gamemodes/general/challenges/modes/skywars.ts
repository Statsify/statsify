/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field, FieldOptions } from "../../../../../metadata";
import { add } from "@statsify/math";
import type { GameChallenges } from "../game-challenges";

const challengeFieldData: FieldOptions = {
  leaderboard: {
    limit: 5000,
    additionalFields: ["stats.general.challenges.skywars.total"],
  },
};

export class SkywarsChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public feedingTheVoid: number;

  @Field(challengeFieldData)
  public rush: number;

  @Field(challengeFieldData)
  public ranked: number;

  @Field(challengeFieldData)
  public enderman: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.feedingTheVoid = challenges.SKYWARS__feeding_the_void_challenge;
    this.rush = challenges.SKYWARS__rush_challenge;
    this.ranked = challenges.SKYWARS__ranked_challenge;
    this.enderman = challenges.SKYWARS__enderman_challenge;

    this.total = add(this.feedingTheVoid, this.rush, this.ranked, this.enderman);
  }
}
