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

export class ArcadeQuests implements GameQuests {
  @Field(questFieldData)
  public gamer: number;

  @Field(questFieldData)
  public winner: number;

  @Field(questFieldData)
  public specialist: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.ARCADE)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.gamer = getAmountDuring(quests.arcade_gamer, time);
      this.winner = getAmountDuring(quests.arcade_winner, time);
    }

    if (time == undefined || time === "week") {
      this.specialist = getAmountDuring(quests.arcade_specialist, time);
    }

    this.total = add(this.gamer, this.winner, this.specialist);
  }
}
