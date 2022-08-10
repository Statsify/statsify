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

export class PitQuests implements GameQuests {
  @Field(questFieldData)
  public hunter: number;

  @Field(questFieldData)
  public contracted: number;

  @Field(questFieldData)
  public doubleUp: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.PIT)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.hunter = getAmountDuring(quests.prototype_pit_daily_kills, time);
      this.contracted = getAmountDuring(quests.prototype_pit_daily_contract, time);
    }

    if (time == undefined || time === "week") {
      this.doubleUp = getAmountDuring(quests.prototype_pit_weekly_gold, time);
    }

    this.total = add(this.hunter ?? 0, this.contracted ?? 0, this.doubleUp ?? 0);
  }
}
