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

export class MurderMysteryQuests implements GameQuests {
  @Field(questFieldData)
  public winner: number;

  @Field(questFieldData)
  public powerPlay: number;

  @Field(questFieldData)
  public hitman: number;

  @Field(questFieldData)
  public infector: number;

  @Field(questFieldData)
  public professional: number;

  @Field(questFieldData)
  public bigWinner: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.MURDER_MYSTERY)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.winner = getAmountDuring(quests.mm_daily_win, time);
      this.powerPlay = getAmountDuring(quests.mm_daily_power_play, time);
      this.hitman = getAmountDuring(quests.mm_daily_target_kill, time);
      this.infector = getAmountDuring(quests.mm_daily_infector, time);
    }

    if (time == undefined || time === "week") {
      this.professional = getAmountDuring(quests.mm_weekly_murderer_kills, time);
      this.bigWinner = getAmountDuring(quests.mm_weekly_wins, time);
    }

    this.total = add(
      this.winner ?? 0,
      this.powerPlay ?? 0,
      this.hitman ?? 0,
      this.infector ?? 0,
      this.professional ?? 0,
      this.bigWinner ?? 0
    );
  }
}
