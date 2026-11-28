/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HttpModule } from "@nestjs/axios";
import { HypixelModule } from "#hypixel";
import { IMAGE_DOWNLOAD_TIMEOUT } from "@statsify/rendering";
import { Module, forwardRef } from "@nestjs/common";
import { Player, SkyBlockStats } from "@statsify/schemas";
import { PlayerModule } from "#player";
import { SkyBlockController } from "./skyblock.controller.js";
import { SkyBlockCopiesService } from "./skyblock-copies.service.js";
import { SkyBlockIconsService } from "./skyblock-icons.service.js";
import { SkyBlockLeaderboardController } from "./leaderboards/skyblock-leaderboard.controller.js";
import { SkyBlockLeaderboardService } from "./leaderboards/skyblock-leaderboard.service.js";
import {
  SkyBlockGarden,
  SkyBlockMuseum,
  SkyBlockProfiles,
} from "./skyblock.model.js";
import { SkyBlockPricesService } from "./skyblock-prices.service.js";
import { SkyBlockResourcesService } from "./skyblock-resources.service.js";
import { SkyBlockSearchController } from "./search/skyblock-search.controller.js";
import { SkyBlockSearchService } from "./search/skyblock-search.service.js";
import { SkyBlockService } from "./skyblock.service.js";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [
    HypixelModule,
    forwardRef(() => PlayerModule),
    TypegooseModule.forFeature([
      SkyBlockProfiles,
      SkyBlockMuseum,
      SkyBlockGarden,
      SkyBlockStats,
      Player,
    ]),
    HttpModule.register({ timeout: IMAGE_DOWNLOAD_TIMEOUT }),
  ],
  controllers: [
    SkyBlockController,
    SkyBlockSearchController,
    SkyBlockLeaderboardController,
  ],
  providers: [
    SkyBlockService,
    SkyBlockCopiesService,
    SkyBlockPricesService,
    SkyBlockResourcesService,
    SkyBlockSearchService,
    SkyBlockIconsService,
    SkyBlockLeaderboardService,
  ],
  exports: [SkyBlockService, SkyBlockPricesService, SkyBlockLeaderboardService],
})
export class SkyBlockModule {}
