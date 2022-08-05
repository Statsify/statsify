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
    additionalFields: ["stats.general.challenges.speeduhc.total"],
  },
};

export class SpeedUHCChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public alchemist: number;

  @Field(challengeFieldData)
  public wizard: number;

  @Field(challengeFieldData)
  public marksman: number;

  @Field(challengeFieldData)
  public nether: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.alchemist = challenges.SPEED_UHC__alchemist_challenge;
    this.wizard = challenges.SPEED_UHC__wizard_challenge;
    this.marksman = challenges.SPEED_UHC__marksman_challenge;
    this.nether = challenges.SPEED_UHC__nether_challenge;

    this.total = add(this.alchemist, this.wizard, this.marksman, this.nether);
  }
}
