/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HistoricalExclude } from "./Exclude.js";
import { HistoricalHeader } from "./Header.js";
import { HistoricalInclude } from "./Include.js";
import { HistoricalProgression } from "./Progression.js";

export const Historical = {
  header: HistoricalHeader,
  progression: HistoricalProgression,
  exclude: HistoricalExclude,
  include: HistoricalInclude,
};

export type { HistoricalTimeData } from "./Header.js";
