/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Daily, LastDay, LastMonth, LastWeek, Monthly, Weekly } from "./models";
import { HistoricalController } from "./historical.controller";
import { HistoricalService } from "./historical.service";
import { Module } from "@nestjs/common";
import { PlayerModule } from "../player";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [
    PlayerModule,
    TypegooseModule.forFeature([Daily, Weekly, Monthly, LastDay, LastWeek, LastMonth]),
  ],
  controllers: [HistoricalController],
  providers: [HistoricalService],
})
export class HistoricalModule {}
