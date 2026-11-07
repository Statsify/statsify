/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HttpModule } from "@nestjs/axios";
import { HypixelModule, SKYBLOCK_TIMEOUT } from "#hypixel";
import { Module } from "@nestjs/common";
import { PlayerModule } from "#player";
import { SkyBlockBudgetService } from "./skyblock-budget.service.js";
import { SkyBlockController } from "./skyblock.controller.js";
import { SkyBlockIconsService } from "./skyblock-icons.service.js";
import { SkyBlockMuseum, SkyBlockProfiles } from "./skyblock.model.js";
import { SkyBlockPricesService } from "./skyblock-prices.service.js";
import { SkyBlockService } from "./skyblock.service.js";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [
    HypixelModule,
    PlayerModule,
    TypegooseModule.forFeature([SkyBlockProfiles, SkyBlockMuseum]),
    // HypixelModule's client sends the key on every request; the bazaar and items resource take none.
    HttpModule.register({
      baseURL: "https://api.hypixel.net/",
      timeout: SKYBLOCK_TIMEOUT,
    }),
  ],
  controllers: [SkyBlockController],
  providers: [SkyBlockService, SkyBlockBudgetService, SkyBlockPricesService, SkyBlockIconsService],
  exports: [SkyBlockService, SkyBlockPricesService],
})
export class SkyBlockModule {}
