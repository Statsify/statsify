/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, removeFormatting } from "@statsify/util";
import { Field } from "#metadata";
import { FormattedGame } from "#game";
import { add } from "@statsify/math";
import { challengeFieldData } from "../util.js";
import type { GameChallenges } from "../game-challenges.js";

export class SmashHeroesChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public leaderboard: number;

  @Field(challengeFieldData)
  public crystal: number;

  @Field(challengeFieldData)
  public smash: number;

  @Field(challengeFieldData)
  public flawless: number;

  @Field({
    leaderboard: {
      fieldName: `${removeFormatting(FormattedGame.SMASH_HEROES)} Total`,
      name: "Total",
    },
  })
  public total: number;

  public constructor(challenges: APIData) {
    this.leaderboard = challenges.SUPER_SMASH__leaderboard_challenge;
    this.crystal = challenges.SUPER_SMASH__crystal_challenge;
    this.smash = challenges.SUPER_SMASH__smash_challenge;
    this.flawless = challenges.SUPER_SMASH__flawless_challenge;

    this.total = add(this.leaderboard, this.crystal, this.smash, this.flawless);
  }
}
