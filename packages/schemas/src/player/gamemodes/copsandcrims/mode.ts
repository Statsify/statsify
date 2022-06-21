/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import { Field } from "../../../metadata";
import { ratio } from "@statsify/math";

export class Defusal {
  @Field()
  public wins: number;

  @Field()
  public roundWins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field({ leaderboard: { enabled: false } })
  public headshotKills: number;

  @Field()
  public assists: number;

  @Field()
  public bombsPlanted: number;

  @Field()
  public bombsDefused: number;

  public constructor(data: APIData) {
    this.wins = data.game_wins;
    this.roundWins = data.round_wins;
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);
    this.headshotKills = data.headshot_kills;
    this.assists = data.assists;
    this.bombsPlanted = data.bombs_planted;
    this.bombsDefused = data.bombs_defused;
  }
}

export class Deathmatch {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  public constructor(data: APIData) {
    this.wins = data.game_wins_deathmatch;
    this.kills = data.kills_deathmatch;
    this.deaths = data.deaths_deathmatch;
    this.kdr = ratio(this.kills, this.deaths);
    this.assists = data.assists_deathmatch;
  }
}

export class GunGame {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public assists: number;

  @Field({ leaderboard: { enabled: false } })
  public fastestWin: number;

  public constructor(data: APIData) {
    this.wins = data.game_wins_gungame;
    this.kills = data.kills_gungame;
    this.deaths = data.deaths_gungame;
    this.kdr = ratio(this.kills, this.deaths);
    this.assists = data.assists_gungame;
    this.fastestWin = data.fastest_win_gungame;
  }
}
