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

export class BlitzQuests implements GameQuests {
  @Field(questFieldData)
  public gameOfTheDay: number;

  @Field(questFieldData)
  public winNormal: number;

  @Field(questFieldData)
  public chestLooter: number;

  @Field(questFieldData)
  public kills: number;

  @Field(questFieldData)
  public master: number;

  @Field(questFieldData)
  public expert: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.BLITZSG)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.gameOfTheDay = getAmountDuring(quests.blitz_game_of_the_day, time);
      this.winNormal = getAmountDuring(quests.blitz_win, time);
      this.chestLooter = getAmountDuring(quests.blitz_loot_chest_daily, time);
      this.kills = getAmountDuring(quests.blitz_kills, time);
    }

    if (time == undefined || time === "week") {
      this.master = getAmountDuring(quests.blitz_weekly_master, time);
      this.expert = getAmountDuring(quests.blitz_loot_chest_weekly, time);
    }

    this.total = add(
      this.gameOfTheDay ?? 0,
      this.winNormal ?? 0,
      this.chestLooter ?? 0,
      this.kills ?? 0,
      this.master ?? 0,
      this.expert ?? 0
    );
  }
}
