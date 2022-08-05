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
    additionalFields: ["stats.general.challenges.turbokartracers.total"],
  },
};

export class TurboKartRacersChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public coin: number;

  @Field(challengeFieldData)
  public firstPlace: number;

  @Field(challengeFieldData)
  public banana: number;

  @Field(challengeFieldData)
  public leaderboard: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.coin = challenges.GINGERBREAD__coin_challenge;
    this.firstPlace = challenges.GINGERBREAD__first_place_challenge;
    this.banana = challenges.GINGERBREAD__banana_challenge;
    this.leaderboard = challenges.GINGERBREAD__leaderboard_challenge;

    this.total = add(this.coin, this.firstPlace, this.banana, this.leaderboard);
  }
}
