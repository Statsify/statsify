/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, findScoreIndex, formatTime } from "@statsify/util";
import { Field } from "#metadata";
import { add, ratio, sub } from "@statsify/math";

const limit = 10_000;

export class BlitzSGKit {
  @Field({ leaderboard: { limit } })
  public gamesPlayed: number;

  @Field({ leaderboard: { enabled: false }, store: { default: 1 } })
  public level: number;

  @Field({ leaderboard: { limit, fieldName: "EXP" } })
  public exp: number;

  @Field({ leaderboard: { enabled: false } })
  public prestige: number;

  @Field({ leaderboard: { limit } })
  public kills: number;

  @Field({ leaderboard: { limit } })
  public deaths: number;

  @Field({ leaderboard: { limit } })
  public kdr: number;

  @Field({ leaderboard: { limit } })
  public wins: number;

  @Field({ leaderboard: { enabled: false } })
  public losses: number;

  @Field({ leaderboard: { limit } })
  public wlr: number;

  @Field({
    store: { required: false },
    leaderboard: { formatter: formatTime },
    historical: { enabled: false },
  })
  public playtime: number;

  public constructor(data: APIData, kit: string) {
    this.gamesPlayed = data[`games_played_${kit}`];

    this.exp = data[`exp_${kit}`];
    this.prestige = data[`p${kit}`];

    this.wins = add(data[`wins_${kit}`], data[`wins_teams_${kit}`]);
    this.deaths = sub(this.gamesPlayed, this.wins);

    this.losses = this.deaths;
    this.wlr = ratio(this.wins, this.losses);

    this.kills = data[`kills_${kit}`];
    this.kdr = ratio(this.kills, this.deaths);

    this.playtime = (data[`time_played_${kit}`] ?? 0) * 1000;

    const defaultKits = [
      "archer",
      "meatmaster",
      "speleologist",
      "baker",
      "knight",
      "guardian",
      "scout",
      "hunter",
      "hype train",
      "fisherman",
      "armorer",
    ];

    const specialKits = ["donkeytamer", "warrior", "ranger", "phoenix", "milkman"];

    if (kit in data) {
      this.level = data[kit] + 1;
    } else if (defaultKits.includes(kit) && this.exp > 0) {
      this.level = 1;
    } else if (specialKits.includes(kit)) {
      const prestiges = [1, 100, 250, 500, 1000, 1500, 2000, 2500, 5000, 10_000];

      this.level =
        findScoreIndex(
          prestiges.map((n) => ({ req: n })),
          this.exp
        ) + 1;
    }

    this.level = this.level ?? 1;
  }
}
