/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LeaderboardService } from '../../src/leaderboards';
import { MockClass } from './mock.type';

export const leaderboardService: MockClass<LeaderboardService> = {
  addLeaderboards: jest.fn().mockResolvedValue([]),
  getLeaderboard: jest.fn().mockResolvedValue([]),
  getLeaderboardRanking: jest.fn().mockResolvedValue(1),
  getLeaderboardDocument: jest.fn().mockResolvedValue({}),
};
