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

export class DuelsQuests implements GameQuests {
  @Field(questFieldData)
  public player: number;

  @Field(questFieldData)
  public killer: number;

  @Field(questFieldData)
  public winner: number;

  @Field(questFieldData)
  public weeklyKills: number;

  @Field(questFieldData)
  public weeklyWins: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.DUELS)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.player = getAmountDuring(quests.duels_player, time);
      this.killer = getAmountDuring(quests.duels_killer, time);
      this.winner = getAmountDuring(quests.duels_winner, time);
    }

    if (time == undefined || time === "week") {
      this.weeklyKills = getAmountDuring(quests.duels_weekly_kills, time);
      this.weeklyWins = getAmountDuring(quests.duels_weekly_wins, time);
    }

    this.total = add(
      this.player ?? 0,
      this.killer ?? 0,
      this.winner ?? 0,
      this.weeklyKills ?? 0,
      this.weeklyWins ?? 0
    );
  }
}
