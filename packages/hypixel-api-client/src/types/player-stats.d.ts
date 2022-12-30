/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIData, BasicStats } from "./helpers";
import type { HypixelGameMode } from "./games";
import type { HypixelPitStats } from "./stats";

export type HypixelPlayerStats = {
  [key: HypixelGameMode]: BasicStats | APIData;
  Pit: HypixelPitStats;
};
