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

export class WallsQuests implements GameQuests {
  @Field(questFieldData)
  public waller: number;

  @Field(questFieldData)
  public kills: number;

  @Field(questFieldData)
  public win: number;

  @Field(questFieldData)
  public wallsWeekly: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.WALLS)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.waller = getAmountDuring(quests.walls_daily_play, time);
      this.kills = getAmountDuring(quests.walls_daily_kill, time);
      this.win = getAmountDuring(quests.walls_daily_win, time);
    }

    if (time == undefined || time === "week") {
      this.wallsWeekly = getAmountDuring(quests.walls_weekly, time);
    }

    this.total = add(
      this.waller ?? 0,
      this.kills ?? 0,
      this.win ?? 0,
      this.kills ?? 0,
      this.wallsWeekly ?? 0
    );
  }
}
