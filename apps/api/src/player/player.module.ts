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
import { Player } from "@statsify/schemas";

import { PlayerLeaderboardsController } from "./leaderboards/player-leaderboard.controller.js";
import { PlayerLeaderboardService } from "./leaderboards/player-leaderboard.service.js";
import { PlayerController } from "./player.controller.js";
import { PlayerService } from "./player.service.js";
import { PlayerSearchController } from "./search/player-search.controller.js";
import { PlayerSearchService } from "./search/player-search.service.js";

@Module({
  imports: [HypixelModule, TypegooseModule.forFeature([Player])],
  controllers: [PlayerController, PlayerLeaderboardsController, PlayerSearchController],
  providers: [PlayerService, PlayerLeaderboardService, PlayerSearchService],
  exports: [PlayerService],
})
export class PlayerModule {}
