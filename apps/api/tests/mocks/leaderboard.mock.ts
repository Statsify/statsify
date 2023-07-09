/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LeaderboardService } from "../../src/leaderboards";
import { MockClass } from "./mock.type.js";

export const leaderboardService: MockClass<LeaderboardService> = {
  addLeaderboards: vi.fn().mockResolvedValue([]),
  getLeaderboard: vi.fn().mockResolvedValue([]),
  getLeaderboardRanking: vi.fn().mockResolvedValue(1),
  getLeaderboardDocument: vi.fn().mockResolvedValue({}),
};
