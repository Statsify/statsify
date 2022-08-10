/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, removeFormatting } from "@statsify/util";
import { Field } from "../../../../../metadata";
import { FormattedGame } from "../../../../../game";
import { add } from "@statsify/math";
import { challengeFieldData } from "../util";
import type { GameChallenges } from "../game-challenges";

export class PaintballChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public killStreak: number;

  @Field(challengeFieldData)
  public killingSpree: number;

  @Field(challengeFieldData)
  public nuke: number;

  @Field(challengeFieldData)
  public finish: number;

  @Field({
    leaderboard: {
      fieldName: `${removeFormatting(FormattedGame.PAINTBALL)} Total`,
      name: "Total",
    },
  })
  public total: number;

  public constructor(challenges: APIData) {
    this.killStreak = challenges.PAINTBALL__kill_streak_challenge;
    this.killingSpree = challenges.PAINTBALL__killing_spree_challenge;
    this.nuke = challenges.PAINTBALL__nuke_challenge;
    this.finish = challenges.PAINTBALL__finish_challenge;

    this.total = add(this.killStreak, this.killingSpree, this.nuke, this.finish);
  }
}
