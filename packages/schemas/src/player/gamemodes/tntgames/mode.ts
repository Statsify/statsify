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

export class BowSpleef {
  @Field()
  public wins: number;

  @Field({ leaderboard: { enabled: false } })
  public hits: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  public constructor(data: APIData) {
    this.wins = data.wins_bowspleef;
    this.hits = data.tags_bowspleef;
    this.losses = data.deaths_bowspleef;
    this.wlr = ratio(this.wins, this.losses);
  }
}

export class PVPRun {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  public constructor(data: APIData) {
    this.wins = data.wins_pvprun;
    this.kills = data.kills_pvprun;
    this.deaths = data.deaths_pvprun;
    this.kdr = ratio(this.kills, this.deaths);
  }
}

export class TNTRun {
  @Field()
  public wins: number;

  @Field()
  public losses: number;

  @Field()
  public wlr: number;

  @Field({ leaderboard: { formatter: formatTime }, historical: { enabled: false } })
  public record: number;

  public constructor(data: APIData) {
    this.wins = data.wins_tntrun;
    this.losses = data.deaths_tntrun;
    this.wlr = ratio(this.wins, this.losses);
    this.record = (data.record_tntrun ?? 0) * 1000;
  }
}

export class TNTTag {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field({ leaderboard: { enabled: false } })
  public tags: number;

  public constructor(data: APIData, ap: APIData) {
    this.wins = data.wins_tntag;
    this.kills = data.kills_tntag;
    this.tags = ap.tntgames_clinic;
  }
}

export class Wizards {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  public constructor(data: APIData) {
    this.wins = data.wins_capture;
    this.kills = data.kills_capture;
    this.deaths = data.deaths_capture;
    this.kdr = ratio(this.kills, this.deaths);
  }
}
