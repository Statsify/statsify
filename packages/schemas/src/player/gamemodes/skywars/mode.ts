/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, formatTime } from "@statsify/util";
import { Field } from "#metadata";
import { add, ratio } from "@statsify/math";

export class SkyWarsMode {
  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public gamesPlayed: number;

  @Field()
  public assists: number;

  @Field({ leaderboard: { formatter: formatTime }, historical: { enabled: false } })
  public playtime: number;

  //Kit gets applied in the main class
  @Field({ store: { default: "default" } })
  public kit: string;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.losses = data[`losses${mode}`];
    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.gamesPlayed = add(this.wins, this.losses);
    this.assists = data[`assists${mode}`];

    //Convert to milliseconds
    this.playtime = (data[`time_played${mode}`] ?? 0) * 1000;

    SkyWarsMode.applyRatios(this);
  }

  public static applyRatios(data: SkyWarsMode) {
    data.kdr = ratio(data.kills, data.deaths);
    data.wlr = ratio(data.wins, data.losses);
  }
}

export class ChallengesSkyWars {
  @Field()
  public totalWins: number;

  @Field()
  public archerWins: number;

  @Field()
  public halfHealthWins: number;

  @Field()
  public noBlockWins: number;

  @Field()
  public noChestWins: number;

  @Field()
  public paperWins: number;

  @Field()
  public rookieWins: number;

  @Field({ leaderboard: { fieldName: "UHC Wins" } })
  public uhcWins: number;

  @Field()
  public ultimateWarriorWins: number;

  public constructor(data: APIData) {
    this.totalWins = data.challenge_wins;
    this.archerWins = data.challenge_wins_archer;
    this.halfHealthWins = data.challenge_wins_half_health;
    this.noBlockWins = data.challenge_wins_no_block;
    this.noChestWins = data.challenge_wins_no_chest;
    this.paperWins = data.challenge_wins_paper;
    this.rookieWins = data.challenge_wins_rookie;
    this.uhcWins = data.challenge_wins_uhc;
    this.ultimateWarriorWins = data.challenge_wins_ultimate_warrior;
  }
}