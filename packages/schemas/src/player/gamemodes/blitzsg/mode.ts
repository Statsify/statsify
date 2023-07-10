/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { add, ratio } from "@statsify/math";
import type { APIData } from "@statsify/util";

export class BlitzSGMode {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  public constructor(data: APIData, mode: string) {
    mode = mode ? `_${mode}` : mode;

    this.wins = data[`wins${mode || "_solo_normal"}`];
    this.kills = data[`kills${mode}`];
  }
}

export class BlitzSGOverall {
  @Field()
  public wins: number;

  @Field()
  public kills: number;

  @Field()
  public deaths: number;

  @Field()
  public kdr: number;

  public constructor(data: APIData) {
    this.wins = add(data.wins_solo_normal, data.wins_teams_normal);
    this.kills = data.kills;
    this.deaths = data.deaths;
    this.kdr = ratio(this.kills, this.deaths);
  }
}
