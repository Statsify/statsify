/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { Module } from '@nestjs/common';
import { Guild, Player } from '@statsify/schemas';
import { HypixelModule } from '../hypixel';
import { LeaderboardModule } from '../leaderboards';
import { PlayerModule } from '../player';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';
import { GuildLeaderboardController } from './leaderboards/guild-leaderboard.controller';
import { GuildLeaderboardService } from './leaderboards/guild-leaderboard.service';

@Module({
  imports: [
    HypixelModule,
    PlayerModule,
    LeaderboardModule,
    TypegooseModule.forFeature([Guild, Player]),
  ],
  controllers: [GuildController, GuildLeaderboardController],
  providers: [GuildService, GuildLeaderboardService],
})
export class GuildModule {}
