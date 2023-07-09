/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Daily,
  LastDay,
  LastMonth,
  LastWeek,
  Monthly,
  Session,
  Weekly,
} from "./models/index.js";
import { HistoricalController } from "./historical.controller.js";
import { HistoricalLeaderboardService } from "./leaderboards/historical-leaderboard.service.js";
import { HistoricalLeaderboardsController } from "./leaderboards/historical-leaderboard.controller.js";
import { HistoricalService } from "./historical.service.js";
import { Module, forwardRef } from "@nestjs/common";
import { Player } from "@statsify/schemas";
import { PlayerModule } from "#player";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [
    forwardRef(() => PlayerModule),
    TypegooseModule.forFeature([
      Daily,
      Weekly,
      Monthly,
      LastDay,
      LastWeek,
      LastMonth,
      Session,
      Player,
    ]),
  ],
  controllers: [HistoricalController, HistoricalLeaderboardsController],
  providers: [HistoricalService, HistoricalLeaderboardService],
  exports: [HistoricalLeaderboardService],
})
export class HistoricalModule {}
