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
import { GameChallenges } from "../../../GameChallenges";
import { add } from "@statsify/math";

const challengeFieldData: FieldOptions = {
  leaderboard: { limit: 5000, additionalFields: ["challenges.skyclash.total"] },
};

export class SkyclashChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public enderchest: number;

  @Field(challengeFieldData)
  public teamwork: number;

  @Field(challengeFieldData)
  public fighter: number;

  @Field(challengeFieldData)
  public monsterKiller: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.enderchest = challenges.SKYCLASH__enderchest_challenge;
    this.teamwork = challenges.SKYCLASH__teamwork_challenge;
    this.fighter = challenges.SKYCLASH__fighter_challenge;
    this.monsterKiller = challenges.SKYCLASH__monster_killer_challenge;

    this.total = add(this.enderchest, this.teamwork, this.fighter, this.monsterKiller);
  }
}
