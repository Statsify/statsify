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

export class TNTGamesChallenges implements GameChallenges {
  @Field({
    ...challengeFieldData,
    leaderboard: { ...challengeFieldData.leaderboard, name: "TNT Run" },
  })
  public tntRun: number;

  @Field({
    ...challengeFieldData,
    leaderboard: { ...challengeFieldData.leaderboard, name: "PVP Run" },
  })
  public pvpRun: number;

  @Field(challengeFieldData)
  public bowSpleef: number;

  @Field({
    ...challengeFieldData,
    leaderboard: { ...challengeFieldData.leaderboard, name: "TNT Tag" },
  })
  public tntTag: number;

  @Field({
    ...challengeFieldData,
    leaderboard: { ...challengeFieldData.leaderboard, name: "TNT Wizards" },
  })
  public tntWizards: number;

  @Field({
    leaderboard: {
      fieldName: `${removeFormatting(FormattedGame.TNT_GAMES)} Total`,
      name: "Total",
    },
  })
  public total: number;

  public constructor(challenges: APIData) {
    this.tntRun = challenges.TNTGAMES__tnt_run_challenge;
    this.pvpRun = challenges.TNTGAMES__pvp_run_challenge;
    this.bowSpleef = challenges.TNTGAMES__bow_spleef_challenge;
    this.tntTag = challenges.TNTGAMES__tnt_tag_challenge;
    this.tntWizards = challenges.TNTGAMES__tnt_wizards_challenge;

    this.total = add(
      this.tntRun,
      this.pvpRun,
      this.bowSpleef,
      this.tntTag,
      this.tntWizards
    );
  }
}
