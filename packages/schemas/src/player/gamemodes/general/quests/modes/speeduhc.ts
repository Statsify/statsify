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

export class SpeedUHCQuests implements GameQuests {
  @Field(questFieldData)
  public soloSpeedBrawler: number;

  @Field({ leaderboard: { enabled: false } }) // Quest no longer available
  public teamSpeedBrawler: number;

  @Field(questFieldData)
  public madness: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.SPEED_UHC)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined) {
      this.teamSpeedBrawler = getAmountDuring(quests.team_brawler, time);
    }

    if (time == undefined || time === "day") {
      this.soloSpeedBrawler = getAmountDuring(quests.solo_brawler, time);
    }

    if (time == undefined || time === "week") {
      this.madness = getAmountDuring(quests.uhc_madness, time);
    }

    this.total = add(
      this.soloSpeedBrawler ?? 0,
      this.teamSpeedBrawler ?? 0,
      this.madness ?? 0
    );
  }
}
