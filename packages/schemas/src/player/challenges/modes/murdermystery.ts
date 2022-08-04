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
  leaderboard: { limit: 5000, additionalFields: ["challenges.murdermystery.total"] },
};

export class MurderMysteryChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public murderSpree: number;

  @Field(challengeFieldData)
  public sherlock: number;

  @Field(challengeFieldData)
  public hero: number;

  @Field(challengeFieldData)
  public serialKiller: number;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
    this.murderSpree = challenges.MURDER_MYSTERY__murder_spree;
    this.sherlock = challenges.MURDER_MYSTERY__sherlock;
    this.hero = challenges.MURDER_MYSTERY__hero;
    this.serialKiller = challenges.MURDER_MYSTERY__serial_killer;

    this.total = add(this.murderSpree, this.sherlock, this.hero, this.serialKiller);
  }
}
