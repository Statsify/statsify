/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HistoricalExclude } from "./Historical-Exclude.js";
import { HistoricalHeader } from "./Historical-Header.js";
import { HistoricalProgression } from "./Historical-Progression.js";

export const Historical = {
	header: HistoricalHeader,
	progression: HistoricalProgression,
	exclude: HistoricalExclude,
};

export type { HistoricalTimeData } from "./Historical-Header.js";
