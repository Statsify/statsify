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
    additionalFields: ["stats.general.quests.ARENA_BRAWL.total"],
  },
  store: { default: null },
};

export class ArenaQuests implements GameQuests {
  @Field({ ...questFieldData, leaderboard: { name: "Play Arena (Daily)" } })
  public dailyPlayArena: number;

  @Field(questFieldData)
  public kills: number;

  @Field(questFieldData)
  public wins: number;

  @Field({ ...questFieldData, leaderboard: { name: "Play Arena (Weekly)" } })
  public weeklyPlayArena: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.ARENA_BRAWL)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.dailyPlayArena = getAmountDuring(quests.arena_daily_play, time);
      this.kills = getAmountDuring(quests.arena_daily_kills, time);
      this.wins = getAmountDuring(quests.arena_daily_wins, time);
    }

    if (time == undefined || time === "week") {
      this.weeklyPlayArena = getAmountDuring(quests.arena_weekly_play, time);
    }

    this.total = add(this.dailyPlayArena, this.kills, this.wins, this.weeklyPlayArena);
  }
}
