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
    additionalFields: ["stats.general.challenges.buildbattle.total"],
  },
};

export class BuildBattleChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public topThree: number;

  @Field(challengeFieldData)
  public guesser: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.topThree = challenges.BUILD_BATTLE__top_3_challenge;
    this.guesser = challenges.BUILD_BATTLE__guesser_challenge;

    this.total = add(this.topThree, this.guesser);
  }
}
