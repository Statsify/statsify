/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HistoricalExclude } from "./Historical-Exclude";
import { HistoricalHeader } from "./Historical-Header";
import { HistoricalProgression } from "./Historical-Progression";

export const Historical = {
  header: HistoricalHeader,
  progression: HistoricalProgression,
  exclude: HistoricalExclude,
};
