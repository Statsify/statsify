/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command } from "@statsify/discord";
import { HistoricalBase } from "./historical.base";
import { HistoricalTimes } from "@statsify/api-client";

@Command({ description: (t) => t("commands.weekly") })
export class WeeklyCommand extends HistoricalBase {
  public constructor() {
    super(HistoricalTimes.WEEKLY);
  }
}
