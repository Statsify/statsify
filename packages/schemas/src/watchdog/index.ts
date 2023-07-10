/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";
import { WatchdogMode } from "./mode.js";
import { deepAdd } from "@statsify/math";
import type { APIData } from "@statsify/util";

export class Watchdog {
  @Field()
  public overall: WatchdogMode;

  @Field()
  public watchdog: WatchdogMode;

  @Field()
  public staff: WatchdogMode;

  public constructor(data: APIData) {
    this.watchdog = new WatchdogMode(data, "watchdog");
    this.staff = new WatchdogMode(data, "staff");
    this.overall = deepAdd(this.watchdog, this.staff);
  }
}
