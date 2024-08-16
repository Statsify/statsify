/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, formatTime } from "@statsify/util";
import { Field } from "#metadata";
import { ratio } from "@statsify/math";

export class CaptureTheWool {
  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public draws: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  @Field()
  public woolCaptured: number;

  @Field()
  public woolPickedUp: number;

  @Field({
    leaderboard: {
      sort: "ASC",
      formatter: formatTime,
      additionalFields: ["this.wins"],
    },
    historical: { enabled: false },
  })
  public fastestWin: number;

  @Field({
    leaderboard: {
      sort: "ASC",
      formatter: formatTime,
      additionalFields: ["this.woolCaptured"],
    },
    historical: { enabled: false },
  })
  public fastestWoolCapture: number;

  @Field({
    leaderboard: { formatter: formatTime },
    historical: { enabled: false },
  })
  public longestGame: number;

  @Field({ leaderboard: { additionalFields: ["this.goldSpent"] } })
  public goldEarned: number;

  @Field({ leaderboard: { additionalFields: ["this.goldEarned"] } })
  public goldSpent: number;

  @Field({ leaderboard: { additionalFields: ["this.deathsToWoolHolder"] } })
  public killsOnWoolHolder: number;

  @Field({ leaderboard: { additionalFields: ["this.killsOnWoolHolder"] } })
  public deathsToWoolHolder: number;

  @Field({ leaderboard: { additionalFields: ["this.deathsAsWoolHolder"] } })
  public killsAsWoolHolder: number;

  @Field({ leaderboard: { additionalFields: ["this.killsAsWoolHolder"] } })
  public deathsAsWoolHolder: number;

  public constructor(data: APIData = {}) {
    this.wins = data.woolhunt_participated_wins;
    this.losses = data.woolhunt_participated_losses;
    this.wlr = ratio(this.wins, this.losses);
    this.draws = data.woolhunt_participated_draws;

    this.kills = data.woolhunt_kills;
    this.deaths = data.woolhunt_deaths;
    this.kdr = ratio(this.kills, this.deaths);
    this.assists = data.woolhunt_assists;

    this.woolCaptured = data.woolhunt_wools_captured;
    this.woolPickedUp = data.woolhunt_wools_stolen;

    this.longestGame = (data.woolhunt_longest_game ?? 0) * 1000;
    this.fastestWin = (data.woolhunt_fastest_win ?? 0) * 1000;
    this.fastestWoolCapture = (data.woolhunt_fastest_wool_capture ?? 0) * 1000;

    this.goldEarned = data.woolhunt_gold_earned;
    this.goldSpent = Math.abs(data.woolhunt_gold_spent ?? 0);

    this.killsOnWoolHolder = data.woolhunt_kills_on_woolholder;
    this.deathsToWoolHolder = data.woolhunt_deaths_to_woolholder;

    this.killsAsWoolHolder = data.woolhunt_kills_with_wool;
    this.deathsAsWoolHolder = data.woolhunt_deaths_with_wool;
  }
}
