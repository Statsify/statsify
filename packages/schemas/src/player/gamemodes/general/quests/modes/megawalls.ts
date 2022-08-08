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
    additionalFields: ["stats.general.quests.MEGAWALLS.total"],
  },
  store: { required: false },
};

export class MegaWallsQuests implements GameQuests {
  @Field(questFieldData)
  public gameOfTheDay: number;

  @Field(questFieldData)
  public win: number;

  @Field(questFieldData)
  public faithful: number;

  @Field(questFieldData)
  public kills: number;

  @Field(questFieldData)
  public megaWaller: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.MEGAWALLS)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.gameOfTheDay = getAmountDuring(quests.mega_walls_play, time);
      this.win = getAmountDuring(quests.mega_walls_win, time);
      this.faithful = getAmountDuring(quests.mega_walls_kill, time);
      this.kills = getAmountDuring(quests.mega_walls_faithful, time);
    }

    if (time == undefined || time === "week") {
      this.megaWaller = getAmountDuring(quests.mega_walls_weekly, time);
    }

    this.total = add(
      this.gameOfTheDay ?? 0,
      this.win ?? 0,
      this.faithful ?? 0,
      this.kills ?? 0,
      this.megaWaller ?? 0
    );
  }
}
