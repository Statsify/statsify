/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { MockClass } from "./mock.type.js";
import { MongoLeaderboardService } from "../../src/leaderboards";

export const mongoLeaderboardService: MockClass<MongoLeaderboardService> = {
  getLeaderboard: vi.fn().mockResolvedValue([]),
  getLeaderboardRanking: vi.fn().mockResolvedValue(1),
};
