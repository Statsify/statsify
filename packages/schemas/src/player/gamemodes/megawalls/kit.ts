/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { add, ratio } from "@statsify/math";
import { type APIData, formatTime } from "@statsify/util";

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

  @Field({
    leaderboard: { limit, formatter: formatTime },
    historical: { enabled: false },
  })
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

    this.finalKills = data[`${kit}final_kills`];
    this.finalAssists = data[`${kit}final_assists`];
    this.finalDeaths = data[`${kit}final_deaths`];

    this.playtime = (data[`${kit}time_played`] ?? 0) * 60_000;
    this.witherDamage = data[`${kit}wither_damage`];
    this.witherKills = data[`${kit}wither_kills`];

    this.points = data[`${kit}class_points`];

    MegaWallsKit.applyRatios(this);
  }

  public static applyRatios(kit: MegaWallsKit) {
    kit.kdr = ratio(kit.kills, kit.deaths);
    kit.fkdr = ratio(kit.finalKills, kit.finalDeaths);
  }
}

export class MegaWallsOverall extends MegaWallsKit {
  @Field()
  declare public wins: number;

  @Field()
  declare public losses: number;

  @Field()
  declare public wlr: number;

  @Field()
  declare public kills: number;

  @Field()
  declare public deaths: number;

  @Field()
  declare public kdr: number;

  @Field()
  declare public finalKills: number;

  @Field()
  declare public finalAssists: number;

  @Field()
  declare public finalDeaths: number;

  @Field()
  declare public fkdr: number;

  @Field()
  declare public assists: number;

  @Field({ leaderboard: { formatter: formatTime } })
  declare public playtime: number;

  public constructor(data: APIData) {
    super(data, "");

    this.finalDeaths = add(data.final_deaths, data.finalDeaths);
    this.witherDamage = add(data.wither_damage, data.witherDamage);
    this.playtime = data.time_played * 60_000;

    MegaWallsOverall.applyRatios(this);
  }
}
