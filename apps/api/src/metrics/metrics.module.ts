/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ActivityService } from "./activity.service.js";
import { MetricsController } from "./metrics.controller.js";
import { Module } from "@nestjs/common";

@Module({
  controllers: [MetricsController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class MetricsModule {}
