/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { FieldOptions } from "../../../metadata/field.options";
import { GameChallenges } from "../../../GameChallenges";
import { add } from "@statsify/math";

const challengeFieldData: FieldOptions = {
  leaderboard: { limit: 5000, additionalFields: ["challenges.duels.total"] },
};

export class DuelsChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public feedTheVoid: number;

  @Field(challengeFieldData)
  public teams: number;

  @Field(challengeFieldData)
  public targetPractice: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.feedTheVoid = challenges.DUELS__feed_the_void_challenge;
    this.teams = challenges.DUELS__teams_challenge;
    this.targetPractice = challenges.DUELS__target_practice_challenge;

    this.total = add(this.feedTheVoid, this.teams, this.targetPractice);
  }
}
