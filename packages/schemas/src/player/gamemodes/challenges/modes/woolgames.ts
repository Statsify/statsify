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

export class WoolGamesChallenges implements GameChallenges {
  @Field({
    ...challengeFieldData,
    leaderboard: { ...challengeFieldData.leaderboard, name: "WoolWars Challenge" },
  })
  public woolWarsChallenge: number;

  @Field({
    ...challengeFieldData,
    leaderboard: { ...challengeFieldData.leaderboard, name: "SheepWars Challenge" },
  })
  public sheepWarsChallenge: number;

  @Field(challengeFieldData)
  public captureTheWoolChallenge: number;

  @Field({
    leaderboard: {
      fieldName: `${removeFormatting(FormattedGame.WOOLGAMES)} Total`,
      name: "Total",
    },
  })
  public total: number;

  public constructor(challenges: APIData) {
    this.woolWarsChallenge = challenges.WOOL_GAMES__wool_wars_challenge;
    this.sheepWarsChallenge = challenges.WOOL_GAMES__sheep_wars_challenge;
    this.captureTheWoolChallenge = challenges.WOOL_GAMES__capture_the_wool_challenge;

    this.total = add(this.woolWarsChallenge, this.sheepWarsChallenge, this.captureTheWoolChallenge);
  }
}
