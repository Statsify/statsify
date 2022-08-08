/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, removeFormatting } from "@statsify/util";
import { Field } from "../../../../../metadata";
import { FieldOptions } from "../../../../../metadata/field.options";
import { FormattedGame } from "../../../../../game";
import { GameQuests } from "../game-quests";
import { QuestTime, getAmountDuring } from "../util";
import { add } from "@statsify/math";

const questFieldData: FieldOptions = {
  leaderboard: {
    limit: 5000,
    additionalFields: ["stats.general.quests.VAMPIREZ.total"],
  },
  store: { required: false },
};

export class VampireZQuests implements GameQuests {
  @Field({ ...questFieldData, leaderboard: { name: "VampireZ" } })
  public vampirez: number;

  @Field(questFieldData)
  public bloodDrinker: number;

  @Field(questFieldData)
  public humanKiller: number;

  @Field(questFieldData)
  public dailyWin: number;

  @Field(questFieldData)
  public vampireWinner: number;

  @Field(questFieldData)
  public vampireSlayer: number;

  @Field(questFieldData)
  public humanSlayer: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.VAMPIREZ)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.vampirez = getAmountDuring(quests.vampirez_daily_play, time);
      this.bloodDrinker = getAmountDuring(quests.vampirez_daily_kill, time);
      this.humanKiller = getAmountDuring(quests.vampirez_daily_human_kill, time);
      this.dailyWin = getAmountDuring(quests.vampirez_daily_win, time);
    }

    if (time == undefined || time === "week") {
      this.vampireWinner = getAmountDuring(quests.vampirez_weekly_win, time);
      this.vampireSlayer = getAmountDuring(quests.blitz_loot_chest_weekly, time);
      this.humanSlayer = getAmountDuring(quests.vampirez_weekly_human_kill, time);
    }

    this.total = add(
      this.vampirez ?? 0,
      this.bloodDrinker ?? 0,
      this.humanKiller ?? 0,
      this.dailyWin ?? 0,
      this.vampireWinner ?? 0,
      this.vampireSlayer ?? 0
    );
  }
}
