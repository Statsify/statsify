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
  leaderboard: { limit: 5000, additionalFields: ["challenges.vampirez.total"] },
};

export class VampireZChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public fang: number;

  @Field(challengeFieldData)
  public gold: number;

  @Field(challengeFieldData)
  public purifying: number;

  @Field(challengeFieldData)
  public lastStand: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.fang = challenges.VAMPIREZ__fang_challenge;
    this.gold = challenges.VAMPIREZ__gold_challenge;
    this.purifying = challenges.VAMPIREZ__purifying_challenge;
    this.lastStand = challenges.VAMPIREZ__last_stand_challenge;

    this.total = add(this.fang, this.gold, this.purifying, this.lastStand);
  }
}
