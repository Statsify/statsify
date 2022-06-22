/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Guild, Player } from "@statsify/schemas";
import { GuildController } from "./guild.controller";
import { GuildLeaderboardController } from "./leaderboards/guild-leaderboard.controller";
import { GuildLeaderboardService } from "./leaderboards/guild-leaderboard.service";
import { GuildService } from "./guild.service";
import { HypixelModule } from "../hypixel";
import { Module } from "@nestjs/common";
import { PlayerModule } from "../player";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [HypixelModule, PlayerModule, TypegooseModule.forFeature([Guild, Player])],
  controllers: [GuildController, GuildLeaderboardController],
  providers: [GuildService, GuildLeaderboardService],
})
export class GuildModule {}
