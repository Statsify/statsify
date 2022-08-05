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
    additionalFields: ["stats.general.challenges.smashheros.total"],
  },
};

export class SmashChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public leaderboard: number;

  @Field(challengeFieldData)
  public crystal: number;

  @Field(challengeFieldData)
  public smash: number;

  @Field(challengeFieldData)
  public flawless: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.leaderboard = challenges.SUPER_SMASH__leaderboard_challenge;
    this.crystal = challenges.SUPER_SMASH__crystal_challenge;
    this.smash = challenges.SUPER_SMASH__smash_challenge;
    this.flawless = challenges.SUPER_SMASH__flawless_challenge;

    this.total = add(this.leaderboard, this.crystal, this.smash, this.flawless);
  }
}
