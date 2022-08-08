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
    additionalFields: ["stats.general.quests.WOOLWARS.total"],
  },
  store: { required: false },
};

export class WoolWarsQuests implements GameQuests {
  @Field(questFieldData)
  public firstPlayOfTheDay: number;

  @Field(questFieldData)
  public winnerWinnerLambDinner: number;

  @Field(questFieldData)
  public kills: number;

  @Field(questFieldData)
  public kingOfTheHerd: number;

  @Field(questFieldData)
  public woolConnoisseur: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.WOOLWARS)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.firstPlayOfTheDay = getAmountDuring(quests.wool_wars_daily_play, time);
      this.winnerWinnerLambDinner = getAmountDuring(quests.wool_wars_daily_wins, time);
      this.kills = getAmountDuring(quests.wool_wars_daily_kills, time);
    }

    if (time == undefined || time === "week") {
      this.kingOfTheHerd = getAmountDuring(quests.wool_weekly_play, time);
      this.woolConnoisseur = getAmountDuring(quests.wool_wars_weekly_shears, time);
    }

    this.total = add(
      this.firstPlayOfTheDay,
      this.winnerWinnerLambDinner,
      this.kills,
      this.kills,
      this.kingOfTheHerd,
      this.woolConnoisseur
    );
  }
}
