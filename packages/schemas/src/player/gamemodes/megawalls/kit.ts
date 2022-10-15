/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, formatTime } from "@statsify/util";
import { Field } from "../../../metadata";
import { add, ratio } from "@statsify/math";

const limit = 10_000;

export class MegaWallsKit {
  @Field({ leaderboard: { limit } })
  public wins: number;

  @Field({ leaderboard: { limit } })
  public losses: number;

  @Field({ leaderboard: { limit } })
  public wlr: number;

  @Field({ leaderboard: { limit } })
  public kills: number;

  @Field({ leaderboard: { limit } })
  public deaths: number;

  @Field({ leaderboard: { limit } })
  public kdr: number;

  @Field({ leaderboard: { limit } })
  public finalKills: number;

  @Field({ leaderboard: { enabled: false } })
  public finalAssists: number;

  @Field({ leaderboard: { limit } })
  public finalDeaths: number;

  @Field({ leaderboard: { limit } })
  public fkdr: number;

  @Field({ leaderboard: { enabled: false } })
  public assists: number;

  @Field({ leaderboard: { limit, formatter: formatTime, historical: false } })
  public playtime: number;

  @Field({ leaderboard: { enabled: false } })
  public witherDamage: number;

  @Field({ leaderboard: { enabled: false } })
  public witherKills: number;

  @Field({ leaderboard: { limit } })
  public points: number;

  public constructor(data: APIData, kit: string) {
    kit = kit ? `${kit}_` : kit;

    this.wins = data[`${kit}wins`];
    this.losses = data[`${kit}losses`];
    this.wlr = ratio(this.wins, this.losses);

    this.kills = data[`${kit}kills`];
    this.assists = data[`${kit}assists`];
    this.deaths = data[`${kit}deaths`];
    this.kdr = ratio(this.kills, this.deaths);

    this.finalKills = data[`${kit}final_kills`];
    this.finalAssists = data[`${kit}final_assists`];
    this.finalDeaths = data[`${kit}final_deaths`];
    this.fkdr = ratio(this.finalKills, this.finalDeaths);

    this.playtime = (data[`${kit}time_played`] ?? 0) * 60_000;
    this.witherDamage = data[`${kit}wither_damage`];
    this.witherKills = data[`${kit}wither_kills`];

    this.points = add(this.finalKills, this.finalAssists, (this.wins ?? 0) * 10);
  }
}

export class MegaWallsOverall extends MegaWallsKit {
  @Field()
  public declare wins: number;

  @Field()
  public declare losses: number;

  @Field()
  public declare wlr: number;

  @Field()
  public declare kills: number;

  @Field()
  public declare deaths: number;

  @Field()
  public declare kdr: number;

  @Field()
  public declare finalKills: number;

  @Field()
  public declare finalAssists: number;

  @Field()
  public declare finalDeaths: number;

  @Field()
  public declare fkdr: number;

  @Field()
  public declare assists: number;

  @Field({ leaderboard: { formatter: formatTime } })
  public declare playtime: number;
}
