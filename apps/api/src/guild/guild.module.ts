/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { MongoModule } from "#mongo";
import { GuildSchema, PlayerSchema } from "@statsify/schemas";
import { GuildController } from "./guild.controller.js";
import { GuildLeaderboardController } from "./leaderboards/guild-leaderboard.controller.js";
import { GuildLeaderboardService } from "./leaderboards/guild-leaderboard.service.js";
import { GuildService } from "./guild.service.js";
import { HypixelModule } from "#hypixel";
import { Module } from "@nestjs/common";
import { PlayerModule } from "#player";

@Module({
  imports: [HypixelModule, PlayerModule, MongoModule.forFeature([GuildSchema, PlayerSchema])],
  controllers: [GuildController, GuildLeaderboardController],
  providers: [GuildService, GuildLeaderboardService],
})
export class GuildModule {}
