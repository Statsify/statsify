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
    const prefix = kit ? `${kit}_` : kit;

    this.wins = data[`${prefix}wins`];
    this.losses = data[`${prefix}losses`];
    this.wlr = ratio(this.wins, this.losses);

    this.kills = data[`${prefix}kills`];
    this.assists = data[`${prefix}assists`];
    this.deaths = data[`${prefix}deaths`];

    this.finalKills = data[`${prefix}final_kills`];
    this.finalAssists = data[`${prefix}final_assists`];
    this.finalDeaths = data[`${prefix}final_deaths`];

    this.playtime = (data[`${prefix}time_played`] ?? 0) * 60_000;
    this.witherDamage = data[`${prefix}wither_damage`];
    this.witherKills = data[`${prefix}wither_kills`];

    this.points = data[`${prefix}class_points`];

    MegaWallsKit.applyRatios(this);
  }

  public static applyRatios(kit: MegaWallsKit) {
    kit.kdr = ratio(kit.kills, kit.deaths);
    kit.fkdr = ratio(kit.finalKills, kit.finalDeaths);
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

  public constructor(data: APIData) {
    super(data, "");

    this.finalDeaths = add(data.final_deaths, data.finalDeaths);
    this.witherDamage = add(data.wither_damage, data.witherDamage);

    MegaWallsOverall.applyRatios(this);
  }
}
