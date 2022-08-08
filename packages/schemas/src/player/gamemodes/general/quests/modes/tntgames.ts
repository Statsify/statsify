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
    additionalFields: ["stats.general.quests.TNT_GAMES.total"],
  },
  store: { default: null },
};

export class TNTGamesQuests implements GameQuests {
  @Field(questFieldData)
  public winner: number;

  @Field({ ...questFieldData, leaderboard: { name: "TNT Run (Daily)" } })
  public tntRunDaily: number;

  @Field({ ...questFieldData, leaderboard: { name: "PVP Run (Daily)" } })
  public pvpRunDaily: number;

  @Field({ ...questFieldData, leaderboard: { name: "Bow Spleef (Daily)" } })
  public bowSpleefDaily: number;

  @Field({ ...questFieldData, leaderboard: { name: "TNT Tag (Daily)" } })
  public tntTagDaily: number;

  @Field({ ...questFieldData, leaderboard: { name: "TNT Wizards (Daily)" } })
  public tntWizardsDaily: number;

  @Field(questFieldData)
  public explosiveFanatic: number;

  @Field({ ...questFieldData, leaderboard: { name: "TNT Run (Weekly)" } })
  public tntRunWeekly: number;

  @Field({ ...questFieldData, leaderboard: { name: "PVP Run (Weekly)" } })
  public pvpRunWeekly: number;

  @Field({ ...questFieldData, leaderboard: { name: "Bow Spleef (Weekly)" } })
  public bowSpleefWeekly: number;

  @Field({ ...questFieldData, leaderboard: { name: "TNT Tag (Weekly)" } })
  public tntTagWeekly: number;

  @Field({ ...questFieldData, leaderboard: { name: "TNT Wizards (Weekly)" } })
  public tntWizardsWeekly: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.TNT_GAMES)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.winner = getAmountDuring(quests.tnt_daily_win, time);
      this.tntRunDaily = getAmountDuring(quests.tnt_tntrun_daily, time);
      this.pvpRunDaily = getAmountDuring(quests.tnt_pvprun_daily, time);
      this.bowSpleefDaily = getAmountDuring(quests.tnt_bowspleef_daily, time);
      this.tntTagDaily = getAmountDuring(quests.tnt_tnttag_daily, time);
      this.tntWizardsDaily = getAmountDuring(quests.tnt_wizards_daily, time);
    }

    if (time == undefined || time === "week") {
      this.explosiveFanatic = getAmountDuring(quests.tnt_weekly_play, time);
      this.tntRunWeekly = getAmountDuring(quests.tnt_tntrun_weekly, time);
      this.pvpRunWeekly = getAmountDuring(quests.tnt_pvprun_weekly, time);
      this.bowSpleefWeekly = getAmountDuring(quests.tnt_bowspleef_weekly, time);
      this.tntTagWeekly = getAmountDuring(quests.tnt_tnttag_weekly, time);
      this.tntWizardsWeekly = getAmountDuring(quests.tnt_wizards_weekly, time);
    }

    this.total = add(
      this.winner,
      this.tntRunDaily,
      this.pvpRunDaily,
      this.bowSpleefDaily,
      this.tntTagDaily,
      this.tntWizardsDaily,
      this.explosiveFanatic,
      this.tntRunWeekly,
      this.pvpRunWeekly,
      this.bowSpleefWeekly,
      this.tntTagWeekly,
      this.tntWizardsWeekly
    );
  }
}
