/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { TypegooseModule } from "@m8a/nestjs-typegoose";
import { Module } from "@nestjs/common";

import { HypixelModule } from "#hypixel";
import { PlayerModule } from "#player";
import { Guild, Player } from "@statsify/schemas";

import { GuildController } from "./guild.controller.js";
import { GuildService } from "./guild.service.js";
import { GuildLeaderboardController } from "./leaderboards/guild-leaderboard.controller.js";
import { GuildLeaderboardService } from "./leaderboards/guild-leaderboard.service.js";

@Module({
  imports: [HypixelModule, PlayerModule, TypegooseModule.forFeature([Guild, Player])],
  controllers: [GuildController, GuildLeaderboardController],
  providers: [GuildService, GuildLeaderboardService],
})
export class GuildModule {}
