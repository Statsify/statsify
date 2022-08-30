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

export class UHCChallenges implements GameChallenges {
  @Field(challengeFieldData)
  public longshot: number;

  @Field(challengeFieldData)
  public perfectStart: number;

  @Field(challengeFieldData)
  public hunter: number;

  @Field(challengeFieldData)
  public threat: number;

  @Field({
    leaderboard: {
      fieldName: `${removeFormatting(FormattedGame.UHC)} Total`,
      name: "Total",
    },
  })
  public total: number;

  public constructor(challenges: APIData) {
    this.longshot = challenges.UHC__longshot_challenge;
    this.perfectStart = challenges.UHC__perfect_start_challenge;
    this.hunter = challenges.UHC__hunter_challenge;
    this.threat = challenges.UHC__threat_challenge;

    this.total = add(this.longshot, this.perfectStart, this.hunter, this.threat);
  }
}
