import { Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { MongoLeaderboardService } from './mongo-leaderboard.service';

@Module({
  providers: [LeaderboardService, MongoLeaderboardService],
  exports: [LeaderboardService, MongoLeaderboardService],
})
export class LeaderboardModule {}
