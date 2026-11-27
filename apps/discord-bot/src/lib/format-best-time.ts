/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { formatRaceTime } from "@statsify/util";
import type { LocalizeFunction } from "@statsify/discord";

export const formatBestTime = (t: LocalizeFunction, time: number): string =>
  time === 0 ? `§7${t("stats.notAvailable")}` : formatRaceTime(time);
