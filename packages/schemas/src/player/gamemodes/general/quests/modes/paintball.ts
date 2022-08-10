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

export class PaintballQuests implements GameQuests {
  @Field(questFieldData)
  public paintballer: number;

  @Field(questFieldData)
  public killer: number;

  @Field(questFieldData)
  public expert: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.PAINTBALL)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.paintballer = getAmountDuring(quests.paintballer, time);
      this.killer = getAmountDuring(quests.paintball_killer, time);
    }

    if (time == undefined || time === "week") {
      this.expert = getAmountDuring(quests.paintball_expert, time);
    }

    this.total = add(this.paintballer ?? 0, this.killer ?? 0, this.expert ?? 0);
  }
}
