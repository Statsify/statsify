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
import { GameQuests } from "../game-quests";
import { QuestTime, getAmountDuring, questFieldData } from "../util";
import { add } from "@statsify/math";

export class CopsAndCrimsQuests implements GameQuests {
  @Field({ ...questFieldData, leaderboard: { name: "Win a game! (Defusal)" } })
  public winAGame: number;

  @Field({ ...questFieldData, leaderboard: { name: "Kill 15 players! (Defusal)" } })
  public kill15Players: number;

  @Field({ ...questFieldData, leaderboard: { name: "Get 300 points! (Deathmatch)" } })
  public get300Points: number;

  @Field({ ...questFieldData, leaderboard: { name: "Win a game! (Deathmatch)" } })
  public winADeathmatch: number;

  @Field({ ...questFieldData, leaderboard: { name: "100 kills and 1,500 points" } })
  public killsAndPoints: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.COPS_AND_CRIMS)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.winAGame = getAmountDuring(quests.cvc_win_daily_normal, time);
      this.kill15Players = getAmountDuring(quests.cvc_kill_daily_normal, time);
      this.get300Points = getAmountDuring(quests.cvc_win_daily_deathmatch, time);
    }

    if (time == undefined || time === "week") {
      this.killsAndPoints = getAmountDuring(quests.cvc_kill_weekly, time);
    }

    this.total = add(
      this.winAGame ?? 0,
      this.kill15Players ?? 0,
      this.get300Points ?? 0,
      this.killsAndPoints ?? 0
    );
  }
}
