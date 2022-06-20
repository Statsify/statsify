/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { MongoLeaderboardService } from '../../src/leaderboards';
import { MockClass } from './mock.type';

export const mongoLeaderboardService: MockClass<MongoLeaderboardService> = {
  getLeaderboard: jest.fn().mockResolvedValue([]),
  getLeaderboardRanking: jest.fn().mockResolvedValue(1),
};
