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

export class SpeedUHCMastery {
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

  public constructor(data: APIData, mastery: string) {
    mastery = `_mastery_${mastery}`;

    this.wins = data[`wins${mastery}`];
    this.losses = data[`losses${mastery}`];
    this.kills = data[`kills${mastery}`];
    this.deaths = data[`deaths${mastery}`];

    this.wlr = ratio(this.wins, this.losses);
    this.kdr = ratio(this.kills, this.deaths);
  }
}
