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
    additionalFields: ["stats.general.challenges.bedwars.total"],
  },
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
