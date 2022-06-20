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

export class VampireZLife {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  public constructor(data: APIData, mode: string) {
    this.wins = data[`${mode}_wins`];
    this.kills = data[`${mode}_kills`];
    this.deaths = data[`${mode}_deaths`];

    VampireZLife.applyRatios(this);
  }

  public static applyRatios(data: VampireZLife) {
    data.kdr = ratio(data.kills, data.deaths);
  }
}
