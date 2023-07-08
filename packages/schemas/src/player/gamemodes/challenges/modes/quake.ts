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

export class QuakeChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public powerup: number;

  @Field(challengeFieldData)
  public killingStreak: number;

  @Field({
    ...challengeFieldData,
    leaderboard: { ...challengeFieldData.leaderboard, name: "Don't Blink" },
  })
  public dontBlink: number;

  @Field(challengeFieldData)
  public combo: number;

  @Field({
    leaderboard: {
      fieldName: `${removeFormatting(FormattedGame.QUAKE)} Total`,
      name: "Total",
    },
  })
  public total: number;

  public constructor(challenges: APIData) {
    this.powerup = challenges.QUAKECRAFT__powerup_challenge;
    this.killingStreak = challenges.QUAKECRAFT__killing_streak_challenge;
    this.dontBlink = challenges["QUAKECRAFT__don't_blink_challenge"];
    this.combo = challenges.QUAKECRAFT__combo_challenge;

    this.total = add(this.powerup, this.killingStreak, this.dontBlink, this.combo);
  }
}
