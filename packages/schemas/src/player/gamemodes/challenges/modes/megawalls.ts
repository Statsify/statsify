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

export class MegaWallsChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public wither: number;

  @Field(challengeFieldData)
  public protector: number;

  @Field(challengeFieldData)
  public berserk: number;

  @Field(challengeFieldData)
  public comeback: number;

  @Field({
    leaderboard: {
      fieldName: `${removeFormatting(FormattedGame.MEGAWALLS)} Total`,
      name: "Total",
    },
  })
  public total: number;

  public constructor(challenges: APIData) {
    this.wither = challenges.WALLS3__wither_challenge;
    this.protector = challenges.WALLS3__protector_challenge;
    this.berserk = challenges.WALLS3__berserk_challenge;
    this.comeback = challenges.WALLS3__comeback_challenge;

    this.total = add(this.wither, this.protector, this.berserk, this.comeback);
  }
}
