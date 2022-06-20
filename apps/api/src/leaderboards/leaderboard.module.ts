/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { MongoLeaderboardService } from './mongo-leaderboard.service';

@Module({
  providers: [LeaderboardService, MongoLeaderboardService],
  exports: [LeaderboardService, MongoLeaderboardService],
})
export class LeaderboardModule {}
