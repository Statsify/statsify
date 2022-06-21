/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GuildLeaderboardService } from "../../src/guild/leaderboards/guild-leaderboard.service";
import { MockClass } from "./mock.type";

export const guildLeaderboardService: MockClass<GuildLeaderboardService> = {
  getLeaderboard: jest.fn().mockResolvedValue([]),
  getLeaderboardRanking: jest.fn().mockResolvedValue({ field: "", rank: 1 }),
};
