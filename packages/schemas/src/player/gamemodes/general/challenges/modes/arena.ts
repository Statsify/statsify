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
  leaderboard: { limit: 5000, additionalFields: ["challenges.arena.total"] },
};

export class ArenaChallenges implements GameChallenges {
  @Field({ ...challengeFieldData, leaderboard: { name: "WHERE IS IT" } })
  public whereIsIt: number;

  @Field(challengeFieldData)
  public tripleKill: number;

  @Field(challengeFieldData)
  public noUltimate: number;

  @Field(challengeFieldData)
  public cooperation: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.whereIsIt = challenges.ARENA__where_is_it_challenge;
    this.tripleKill = challenges.ARENA__triple_kill_challenge;
    this.noUltimate = challenges.ARENA__no_ultimate_challenge;
    this.cooperation = challenges.ARENA__no_ultimate_challenge;

    this.total = add(this.whereIsIt, this.tripleKill, this.noUltimate, this.cooperation);
  }
}
