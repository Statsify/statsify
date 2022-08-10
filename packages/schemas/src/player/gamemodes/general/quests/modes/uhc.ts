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

export class UHCQuests implements GameQuests {
  @Field({ ...questFieldData, leaderboard: { name: "Team UHC Champions" } })
  public teamUHCChampions: number;

  @Field({ ...questFieldData, leaderboard: { name: "Solo UHC Champions" } })
  public soloUHCChampions: number;

  @Field({ ...questFieldData, leaderboard: { name: "UHC Deathmatch" } })
  public uhcDeathmatch: number;

  @Field({ ...questFieldData, leaderboard: { name: "UHC Champions" } })
  public uhcChampions: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.UHC)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.teamUHCChampions = getAmountDuring(quests.uhc_team, time);
      this.soloUHCChampions = getAmountDuring(quests.uhc_solo, time);
      this.uhcDeathmatch = getAmountDuring(quests.uhc_dm, time);
    }

    if (time == undefined || time === "week") {
      this.uhcChampions = getAmountDuring(quests.uhc_weekly, time);
    }

    this.total = add(
      this.teamUHCChampions ?? 0,
      this.soloUHCChampions ?? 0,
      this.uhcDeathmatch ?? 0,
      this.uhcChampions ?? 0
    );
  }
}
