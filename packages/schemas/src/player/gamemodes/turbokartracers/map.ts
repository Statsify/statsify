/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import type { APIData } from "@statsify/util";

export class TurboKartRacersMap {
  @Field()
  public gamesPlayed: number;

  @Field()
  public gold: number;

  @Field()
  public silver: number;

  @Field()
  public bronze: number;

  public constructor(data: APIData, map: string) {
    this.gamesPlayed = data[`${map}_plays`];
    this.gold = data[`gold_trophy_${map}`];
    this.silver = data[`silver_trophy_${map}`];
    this.bronze = data[`bronze_trophy_${map}`];
  }
}
