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
    additionalFields: ["stats.general.quests.TURBO_KART_RACERS.total"],
  },
  store: { required: false },
};

export class TurboKartRacersQuests implements GameQuests {
  @Field(questFieldData)
  public blingBling: number;

  @Field(questFieldData)
  public internationalChampionship: number;

  @Field(questFieldData)
  public racer: number;

  @Field(questFieldData)
  public turboKartRacers: number;

  @Field({
    leaderboard: {
      name: "Total",
      fieldName: `${removeFormatting(FormattedGame.TURBO_KART_RACERS)} Total`,
    },
  })
  public total: number;

  public constructor(quests: APIData, time: QuestTime) {
    if (time == undefined || time === "day") {
      this.blingBling = getAmountDuring(quests.gingerbread_bling_bling, time);
      this.internationalChampionship = getAmountDuring(quests.gingerbread_maps, time);
      this.racer = getAmountDuring(quests.gingerbread_racer, time);
    }

    if (time == undefined || time === "week") {
      this.turboKartRacers = getAmountDuring(quests.gingerbread_mastery, time);
    }

    this.total = add(
      this.blingBling ?? 0,
      this.internationalChampionship ?? 0,
      this.racer ?? 0,
      this.turboKartRacers ?? 0
    );
  }
}
