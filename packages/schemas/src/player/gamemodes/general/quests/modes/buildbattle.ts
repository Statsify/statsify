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
    additionalFields: ["stats.general.quests.BUILD_BATTLE.total"],
  },
  store: { required: false },
};

export class BuildBattleQuests implements GameQuests {
  @Field(questFieldData)
  public player: number;

  @Field(questFieldData)
  public winner: number;

  @Field(questFieldData)
  public masterArchitect: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.BUILD_BATTLE)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.player = getAmountDuring(quests.build_battle_player, time);
      this.winner = getAmountDuring(quests.build_battle_winner, time);
    }

    if (time == undefined || time === "week") {
      this.masterArchitect = getAmountDuring(quests.build_battle_weekly, time);
    }

    this.total = add(this.player ?? 0, this.winner ?? 0, this.masterArchitect ?? 0);
  }
}
