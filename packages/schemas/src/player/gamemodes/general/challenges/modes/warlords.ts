/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../../../metadata";
import { FieldOptions } from "../../../../../metadata/field.options";
import { GameChallenges } from "../../../../../GameChallenges";
import { add } from "@statsify/math";

const challengeFieldData: FieldOptions = {
  leaderboard: { limit: 5000, additionalFields: ["challenges.warlords.total"] },
};

export class WarlordsChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public support: number;

  @Field(challengeFieldData)
  public brute: number;

  @Field(challengeFieldData)
  public capture: number;

  @Field(challengeFieldData)
  public carry: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.support = challenges.BATTLEGROUND__support_challenge;
    this.brute = challenges.BATTLEGROUND__brute_challenge;
    this.capture = challenges.BATTLEGROUND__capture_challenge;
    this.carry = challenges.BATTLEGROUND__carry_challenge;

    this.total = add(this.support, this.brute, this.capture, this.carry);
  }
}
