/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, removeFormatting } from "@statsify/util";
import { Field, FieldOptions } from "../../../../../metadata";
import { FormattedGame } from "../../../../../game";
import { add } from "@statsify/math";
import type { GameChallenges } from "../game-challenges";

const challengeFieldData: FieldOptions = {
  leaderboard: {
    limit: 5000,
    additionalFields: ["stats.general.challenges.WALLS.total"],
  },
};

export class WallsChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public firstBlood: number;

  @Field(challengeFieldData)
  public powerhouse: number;

  @Field(challengeFieldData)
  public looting: number;

  @Field(challengeFieldData)
  public doubleKill: number;

  @Field({
    leaderboard: {
      fieldName: `${removeFormatting(FormattedGame.WALLS)} Total`,
      name: "Total",
    },
  })
  public total: number;

  public constructor(challenges: APIData) {
    this.firstBlood = challenges.WALLS__first_blood_challenge;
    this.powerhouse = challenges.WALLS__powerhouse_challenge;
    this.looting = challenges.WALLS__looting_challenge;
    this.doubleKill = challenges.WALLS__double_kill_challenge;

    this.total = add(this.firstBlood, this.powerhouse, this.looting, this.doubleKill);
  }
}
