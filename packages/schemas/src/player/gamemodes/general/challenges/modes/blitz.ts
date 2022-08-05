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
  leaderboard: { limit: 5000, additionalFields: ["challenges.blitz.total"] },
};

export class BlitzChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public star: number;

  @Field(challengeFieldData)
  public ironMan: number;

  @Field(challengeFieldData)
  public blitz: number;

  @Field(challengeFieldData)
  public resistance: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.star = challenges.SURVIVAL_GAMES__star_challenge;
    this.ironMan = challenges.SURVIVAL_GAMES__iron_man_challenge;
    this.blitz = challenges.SURVIVAL_GAMES__blitz_challenge;
    this.resistance = challenges.SURVIVAL_GAMES__resistance_challenge;

    this.total = add(this.star, this.ironMan, this.blitz, this.resistance);
  }
}
