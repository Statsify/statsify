/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HypixelModule } from "#hypixel";
import { Module } from "@nestjs/common";
import { Player } from "@statsify/schemas";
import { PlayerController } from "./player.controller.js";
import { PlayerLeaderboardService } from "./leaderboards/player-leaderboard.service.js";
import { PlayerLeaderboardsController } from "./leaderboards/player-leaderboard.controller.js";
import { PlayerSearchController } from "./search/player-search.controller.js";
import { PlayerSearchService } from "./search/player-search.service.js";
import { PlayerService } from "./player.service.js";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
	imports: [HypixelModule, TypegooseModule.forFeature([Player])],
	controllers: [PlayerController, PlayerLeaderboardsController, PlayerSearchController],
	providers: [PlayerService, PlayerLeaderboardService, PlayerSearchService],
	exports: [PlayerService],
})
export class PlayerModule {}
