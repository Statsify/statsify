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
  leaderboard: { limit: 5000, additionalFields: ["stats.general.quests.BEDWARS.total"] },
  store: { default: null },
};

export class BedwarsQuests implements GameQuests {
  @Field(questFieldData)
  public firstWinOfTheDay: number;

  @Field({ ...questFieldData, leaderboard: { name: "One More Game!" } })
  public oneMoreGame: number;

  @Field({ ...questFieldData, leaderboard: { name: "Bed Removal Co." } })
  public bedRemovalCo: number;

  @Field({ ...questFieldData, leaderboard: { name: "Sleep Tight." } })
  public sleepTight: number;

  @Field(questFieldData)
  public challenger: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.BEDWARS)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.firstWinOfTheDay = getAmountDuring(quests.bedwars_daily_win, time);
      this.oneMoreGame = getAmountDuring(quests.bedwars_daily_one_more, time);
    }

    if (time == undefined || time === "week") {
      this.bedRemovalCo = getAmountDuring(quests.bedwars_weekly_bed_elims, time);
      this.sleepTight = getAmountDuring(quests.bedwars_weekly_dream_win, time);
      this.challenger = getAmountDuring(quests.bedwars_weekly_challenges, time);
    }

    this.total = add(
      this.firstWinOfTheDay,
      this.oneMoreGame,
      this.bedRemovalCo,
      this.sleepTight,
      this.challenger
    );
  }
}
