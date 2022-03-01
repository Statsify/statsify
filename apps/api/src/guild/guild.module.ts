import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { Guild } from '@statsify/schemas';
import { HypixelModule } from '../hypixel';
import { LeaderboardModule } from '../leaderboards';
import { PlayerModule } from '../player';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';
import { GuildLeaderboardController } from './leaderboards/guild-leaderboard.controller';
import { GuildLeaderboardService } from './leaderboards/guild-leaderboard.service';

@Module({
  imports: [HypixelModule, PlayerModule, LeaderboardModule, TypegooseModule.forFeature([Guild])],
  controllers: [GuildController, GuildLeaderboardController],
  providers: [GuildService, GuildLeaderboardService],
})
export class GuildModule {}
