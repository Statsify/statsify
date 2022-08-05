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
import { GameChallenges } from "../game-challenges";
import { add } from "@statsify/math";

const challengeFieldData: FieldOptions = {
  leaderboard: { limit: 5000, additionalFields: ["challenges.bedwars.total"] },
};

export class BedwarsChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public defensive: number;

  @Field(challengeFieldData)
  public support: number;

  @Field(challengeFieldData)
  public offensive: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.defensive = challenges.BEDWARS__defensive;
    this.support = challenges.BEDWARS__support;
    this.offensive = challenges.BEDWARS__offensive;

    this.total = add(this.defensive, this.support, this.offensive);
  }
}
