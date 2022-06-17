import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { Friends, Player } from '@statsify/schemas';
import { HypixelModule } from '../hypixel';
import { PlayerLeaderboardsController } from './leaderboards/player-leaderboard.controller';
import { PlayerLeaderboardService } from './leaderboards/player-leaderboard.service';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';

@Module({
  imports: [HypixelModule, TypegooseModule.forFeature([Player, Friends])],
  controllers: [PlayerController, PlayerLeaderboardsController],
  providers: [PlayerService, PlayerLeaderboardService],
  exports: [PlayerService],
})
export class PlayerModule {}
