/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { ratio } from "@statsify/math";
import type { APIData } from "@statsify/util";

export class ArenaBrawlMode {
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

  public constructor(data: APIData, mode: string) {
    this.kills = data[`kills_${mode}`];
    this.deaths = data[`deaths_${mode}`];
    this.wins = data[`wins_${mode}`];
    this.losses = data[`losses_${mode}`];

    ArenaBrawlMode.applyRatios(this);
  }

  public static applyRatios(data: ArenaBrawlMode) {
    data.kdr = ratio(data.kills, data.deaths);
    data.wlr = ratio(data.wins, data.losses);
  }
}

/**
 * Additional fields for the individual Arena Brawl modes: 1v1, 2v2, 4v4.
 */
export class ArenaBrawlModeExt extends ArenaBrawlMode {
  @Field()
  public winstreak: number;

  public constructor(data: APIData, mode: string) {
    super(data, mode);
    this.winstreak = data[`win_streaks_${mode}`];
  }
}
