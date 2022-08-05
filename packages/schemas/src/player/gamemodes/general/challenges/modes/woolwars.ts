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
    additionalFields: ["stats.general.challenges.woolwars.total"],
  },
};

export class WoolWarsChallanges implements GameChallenges {
  @Field(challengeFieldData)
  public flawless: number;

  @Field(challengeFieldData)
  public builder: number;

  @Field(challengeFieldData)
  public mercilessKiller: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.flawless = challenges.WOOL_GAMES__flawless_challenge;
    this.builder = challenges.WOOL_GAMES__builder_challenge;
    this.mercilessKiller = challenges.WOOL_GAMES__merciless_killer_challenge;

    this.total = add(this.flawless, this.builder, this.mercilessKiller);
  }
}
