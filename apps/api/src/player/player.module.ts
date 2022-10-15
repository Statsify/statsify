/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Daily, Monthly, Weekly } from "../historical/models";
import { Friends, Player } from "@statsify/schemas";
import { HypixelModule } from "../hypixel";
import { Module } from "@nestjs/common";
import { PlayerController } from "./player.controller";
import { PlayerLeaderboardService } from "./leaderboards/player-leaderboard.service";
import { PlayerLeaderboardsController } from "./leaderboards/player-leaderboard.controller";
import { PlayerSearchController } from "./search/player-search.controller";
import { PlayerSearchService } from "./search/player-search.service";
import { PlayerService } from "./player.service";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [
    HypixelModule,
    TypegooseModule.forFeature([Player, Friends, Daily, Weekly, Monthly]),
  ],
  controllers: [PlayerController, PlayerLeaderboardsController, PlayerSearchController],
  providers: [PlayerService, PlayerLeaderboardService, PlayerSearchService],
  exports: [PlayerService],
})
export class PlayerModule {}
