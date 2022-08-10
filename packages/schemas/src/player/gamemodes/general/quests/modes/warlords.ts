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

export class WarlordsQuests implements GameQuests {
  @Field(questFieldData)
  public captureTheFlag: number;

  @Field(questFieldData)
  public teamDeathmatch: number;

  @Field(questFieldData)
  public domination: number;

  @Field(questFieldData)
  public victorious: number;

  @Field({ ...questFieldData, leaderboard: { name: "Carry, Secured!" } })
  public carrySecured: number;

  @Field(questFieldData)
  public dedication: number;

  @Field(questFieldData)
  public allStar: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.WARLORDS)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.captureTheFlag = getAmountDuring(quests.warlords_ctf, time);
      this.teamDeathmatch = getAmountDuring(quests.warlords_tdm, time);
      this.domination = getAmountDuring(quests.warlords_domination, time);
      this.victorious = getAmountDuring(quests.warlords_victorious, time);
      this.carrySecured = getAmountDuring(quests.warlords_objectives, time);
    }

    if (time == undefined || time === "week") {
      this.dedication = getAmountDuring(quests.warlords_dedication, time);
      this.allStar = getAmountDuring(quests.warlords_all_star, time);
    }

    this.total = add(
      this.captureTheFlag ?? 0,
      this.teamDeathmatch ?? 0,
      this.domination ?? 0,
      this.victorious ?? 0,
      this.carrySecured ?? 0,
      this.dedication ?? 0,
      this.allStar ?? 0
    );
  }
}
