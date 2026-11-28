/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HypixelModule } from "#hypixel";
import { Module } from "@nestjs/common";
import { PlayerModule } from "#player";
import { SkyBlockController } from "./skyblock.controller.js";
import { SkyBlockMuseum, SkyBlockProfiles } from "./skyblock.model.js";
import { SkyBlockPricesService } from "./skyblock-prices.service.js";
import { SkyBlockSearchController } from "./search/skyblock-search.controller.js";
import { SkyBlockSearchService } from "./search/skyblock-search.service.js";
import { SkyBlockService } from "./skyblock.service.js";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [
    HypixelModule,
    PlayerModule,
    TypegooseModule.forFeature([SkyBlockProfiles, SkyBlockMuseum]),
  ],
  controllers: [SkyBlockController, SkyBlockSearchController],
  providers: [SkyBlockService, SkyBlockPricesService, SkyBlockSearchService],
})
export class SkyBlockModule {}
