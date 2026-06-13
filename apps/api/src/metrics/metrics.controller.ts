/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ActiveUsersDto } from "#dtos";
import { ActivityService } from "./activity.service.js";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth, AuthRole } from "#auth";
import { Controller, Get, Query } from "@nestjs/common";

@Controller("/metrics")
@ApiTags("Metrics")
export class MetricsController {
  public constructor(private readonly activityService: ActivityService) {}

  @Get("/active")
  @ApiOperation({ summary: "Get Active User Metrics" })
  @Auth({ role: AuthRole.ADMIN })
  public async getActiveUsers(@Query() { days }: ActiveUsersDto) {
    if (days) {
      const activeUsers = await this.activityService.getActiveUsers(days);
      return { success: true, activeUsers };
    }

    const metrics = await this.activityService.getMetrics();

    return { success: true, ...metrics };
  }
}
