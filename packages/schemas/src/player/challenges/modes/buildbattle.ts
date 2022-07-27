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
  leaderboard: { limit: 5000, additionalFields: ["challenges.buildbattle.total"] },
};

export class BuildBattleChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public top3: number;

  @Field(challengeFieldData)
  public guesser: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.top3 = challenges.BUILD_BATTLE__top_3_challenge;
    this.guesser = challenges.BUILD_BATTLE__guesser_challenge;

    this.total = add(this.top3, this.guesser);
  }
}
