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

export class QuakeMode {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field({ leaderboard: { enabled: false } })
  public headshots: number;

  @Field()
  public killstreaks: number;

  @Field({ leaderboard: { enabled: false } })
  public shotsFired: number;

  @Field({ leaderboard: { enabled: false } })
  public postUpdateKills: number;

  @Field({ leaderboard: { enabled: false } })
  public winRate: number;

  @Field({ leaderboard: { enabled: false } })
  public quakeShotAccuracy: number;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.headshots = data[`headshots${mode}`];
    this.killstreaks = data[`killstreaks${mode}`];
    this.shotsFired = data[`shots_fired${mode}`];
    this.postUpdateKills = data[`kills_since_update_feb_2017${mode}`];
    QuakeMode.applyRatios(this);
  }

  public static applyRatios(data: QuakeMode) {
    data.kdr = ratio(data.kills, data.deaths);
    data.winRate = ratio(25, ratio(data.kills, data.wins), 100);
    data.quakeShotAccuracy = ratio(data.postUpdateKills, data.shotsFired, 100);
  }
}
