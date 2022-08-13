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

export class QuakeQuests implements GameQuests {
  @Field(questFieldData)
  public player: number;

  @Field(questFieldData)
  public sniper: number;

  @Field(questFieldData)
  public winner: number;

  @Field({
    ...questFieldData,
    leaderboard: { ...questFieldData.leaderboard, name: "Bazinga!" },
  })
  public bazinga: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.QUAKE)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.player = getAmountDuring(quests.quake_daily_play, time);
      this.sniper = getAmountDuring(quests.quake_daily_kill, time);
      this.winner = getAmountDuring(quests.quake_daily_win, time);
    }

    if (time == undefined || time === "week") {
      this.bazinga = getAmountDuring(quests.quake_weekly_play, time);
    }

    this.total = add(
      this.player ?? 0,
      this.sniper ?? 0,
      this.winner ?? 0,
      this.bazinga ?? 0
    );
  }
}
