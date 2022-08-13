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

export class SkywarsQuests implements GameQuests {
  @Field(questFieldData)
  public soloWin: number;

  @Field(questFieldData)
  public soloKills: number;

  @Field(questFieldData)
  public doublesWin: number;

  @Field(questFieldData)
  public doublesKills: number;

  @Field(questFieldData)
  public labWin: number;

  @Field(questFieldData)
  public corruptedWin: number;

  @Field({
    ...questFieldData,
    leaderboard: { ...questFieldData.leaderboard, name: "Tokens!" },
  })
  public tokens: number;

  @Field(questFieldData)
  public weeklyKills: number;

  @Field(questFieldData)
  public scientist: number;

  @Field(questFieldData)
  public freeLootChest: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.SKYWARS)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.soloWin = getAmountDuring(quests.skywars_solo_win, time);
      this.soloKills = getAmountDuring(quests.skywars_solo_kills, time);
      this.doublesWin = getAmountDuring(quests.skywars_team_win, time);
      this.doublesKills = getAmountDuring(quests.skywars_team_kills, time);
      this.labWin = getAmountDuring(quests.skywars_arcade_win, time);
      this.corruptedWin = getAmountDuring(quests.skywars_corrupt_win, time);
      this.tokens = getAmountDuring(quests.skywars_daily_tokens, time);
    }

    if (time == undefined || time === "week") {
      this.weeklyKills = getAmountDuring(quests.skywars_weekly_kills, time);
      this.scientist = getAmountDuring(quests.skywars_weekly_arcade_win_all, time);
      this.freeLootChest = getAmountDuring(quests.skywars_weekly_free_loot_chest, time);
    }

    this.total = add(
      this.soloWin ?? 0,
      this.soloKills ?? 0,
      this.doublesWin ?? 0,
      this.doublesKills ?? 0,
      this.labWin ?? 0,
      this.corruptedWin ?? 0,
      this.tokens ?? 0,
      this.weeklyKills ?? 0,
      this.scientist ?? 0,
      this.freeLootChest ?? 0
    );
  }
}
