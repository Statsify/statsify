/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, removeFormatting } from "@statsify/util";
import { Field } from "../../../../metadata";
import { FormattedGame } from "../../../../game";
import { add } from "@statsify/math";
import { challengeFieldData } from "../util";
import type { GameChallenges } from "../game-challenges";

export class BuildBattleChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public topThree: number;

  @Field(challengeFieldData)
  public guesser: number;

  @Field({
    leaderboard: {
      fieldName: `${removeFormatting(FormattedGame.BUILD_BATTLE)} Total`,
      name: "Total",
    },
  })
  public total: number;

  public constructor(challenges: APIData) {
    this.topThree = challenges.BUILD_BATTLE__top_3_challenge;
    this.guesser = challenges.BUILD_BATTLE__guesser_challenge;

    this.total = add(this.topThree, this.guesser);
  }
}
