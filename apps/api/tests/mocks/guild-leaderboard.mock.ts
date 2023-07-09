/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GuildLeaderboardService } from "../../src/guild/leaderboards/guild-leaderboard.service.js";
import { MockClass } from "./mock.type.js";
import { vi } from "vitest";

export const guildLeaderboardService: MockClass<GuildLeaderboardService> = {
  getLeaderboard: vi.fn().mockResolvedValue([]),
  getLeaderboardRankings: vi.fn().mockResolvedValue({ field: "", rank: 1 }),
};
