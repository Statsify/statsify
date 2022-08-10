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

export class SmashQuests implements GameQuests {
  @Field(questFieldData)
  public soloWin: number;

  @Field(questFieldData)
  public soloKills: number;

  @Field(questFieldData)
  public teamWin: number;

  @Field(questFieldData)
  public teamKills: number;

  @Field(questFieldData)
  public weeklyKills: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.SMASH_HEROES)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.soloWin = getAmountDuring(quests.supersmash_solo_win, time);
      this.soloKills = getAmountDuring(quests.supersmash_solo_kills, time);
      this.teamWin = getAmountDuring(quests.supersmash_team_win, time);
      this.teamKills = getAmountDuring(quests.supersmash_team_kills, time);
    }

    if (time == undefined || time === "week") {
      this.weeklyKills = getAmountDuring(quests.supersmash_weekly_kills, time);
    }

    this.total = add(
      this.soloWin ?? 0,
      this.soloKills ?? 0,
      this.teamWin ?? 0,
      this.teamKills ?? 0,
      this.weeklyKills ?? 0
    );
  }
}