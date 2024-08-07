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

export class UHCMode {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  @Field()
  public headsEaten: number;

  @Field()
  public ultimatesCrafted: number;

  @Field()
  public extraUltimates: number;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode}`];
    this.kills = data[`kills${mode}`];
    this.deaths = data[`deaths${mode}`];
    this.headsEaten = data[`heads_eaten${mode}`];
    this.extraUltimates = data[`extra_ultimates_crafted${mode}`];
    this.ultimatesCrafted = data[`ultimates_crafted${mode}`];

    UHCMode.applyRatios(this);
  }

  public static applyRatios(data: UHCMode) {
    data.kdr = ratio(data.kills, data.deaths);
  }
}
