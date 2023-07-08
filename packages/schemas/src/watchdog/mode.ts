/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import type { APIData } from "@statsify/util";

export class WatchdogMode {
  @Field()
  public bans: number;

  @Field()
  public lastMinute: number;

  @Field()
  public lastDay: number;

  public constructor(data: APIData, mode: string) {
    this.bans = data[`${mode}_total`];
    this.lastMinute = data[`${mode}_lastMinute`];
    this.lastDay = data[`${mode}_rollingDaily`];
  }
}
