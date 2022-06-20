/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ratio } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

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
