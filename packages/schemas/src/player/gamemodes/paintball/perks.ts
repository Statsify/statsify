/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { add } from '@statsify/math';
import { APIData } from '@statsify/util';
import { Field } from '../../../metadata';

export class PaintballPerks {
  @Field({ leaderboard: { enabled: false } })
  public adrenaline: number;

  @Field({ leaderboard: { enabled: false } })
  public endurance: number;

  @Field({ leaderboard: { enabled: false } })
  public fortune: number;

  @Field({ leaderboard: { enabled: false } })
  public godfather: number;

  @Field({ leaderboard: { enabled: false } })
  public headstart: number;
  @Field({ leaderboard: { enabled: false } })
  public superluck: number;

  @Field({ leaderboard: { enabled: false } })
  public transfusion: number;

  public constructor(data: APIData) {
    this.adrenaline = add(data.adrenaline, 1);
    this.endurance = add(data.endurance, 1);
    this.fortune = add(data.fortune, 1);
    this.godfather = add(data.godfather, 1);
    this.headstart = data.headstart; // Only one properly returned in API
    this.superluck = add(data.superluck, 1);
    this.transfusion = add(data.transfusion, 1);
  }
}
