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

export class WarlordsChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public support: number;

  @Field(challengeFieldData)
  public brute: number;

  @Field(challengeFieldData)
  public capture: number;

  @Field(challengeFieldData)
  public carry: number;

  @Field({
    leaderboard: {
      fieldName: `${removeFormatting(FormattedGame.WARLORDS)} Total`,
      name: "Total",
    },
  })
  public total: number;

  public constructor(challenges: APIData) {
    this.support = challenges.BATTLEGROUND__support_challenge;
    this.brute = challenges.BATTLEGROUND__brute_challenge;
    this.capture = challenges.BATTLEGROUND__capture_challenge;
    this.carry = challenges.BATTLEGROUND__carry_challenge;

    this.total = add(this.support, this.brute, this.capture, this.carry);
  }
}
