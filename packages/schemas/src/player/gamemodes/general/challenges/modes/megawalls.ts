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
  leaderboard: { limit: 5000, additionalFields: ["challenges.megawalls.total"] },
};

export class MegaWallsChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public wither: number;

  @Field(challengeFieldData)
  public protector: number;

  @Field(challengeFieldData)
  public berserk: number;

  @Field(challengeFieldData)
  public comeback: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.wither = challenges.WALLS3__wither_challenge;
    this.protector = challenges.WALLS3__protector_challenge;
    this.berserk = challenges.WALLS3__berserk_challenge;
    this.comeback = challenges.WALLS3__comeback_challenge;

    this.total = add(this.wither, this.protector, this.berserk, this.comeback);
  }
}
