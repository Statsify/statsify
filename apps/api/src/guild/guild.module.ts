import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { Guild, Player } from '@statsify/schemas';
import { HypixelModule } from '../hypixel';
import { PlayerModule } from '../player';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';
import { GuildLeaderboardController } from './leaderboards/guild-leaderboard.controller';
import { GuildLeaderboardService } from './leaderboards/guild-leaderboard.service';

@Module({
  imports: [HypixelModule, PlayerModule, TypegooseModule.forFeature([Guild, Player])],
  controllers: [GuildController, GuildLeaderboardController],
  providers: [GuildService, GuildLeaderboardService],
})
export class GuildModule {}
