/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Controller, Get } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponse, GetGamecountsResponse, GetWatchdogResponse } from '@statsify/api-client';
import { Auth } from '../auth';
import { HypixelService } from '../hypixel';

@Controller(`/hypixelresources`)
@ApiTags('Hypixel Resources')
export class HypixelResourcesController {
  public constructor(private readonly hypixelService: HypixelService) {}

  @Get(`/watchdog`)
  @ApiOperation({ summary: 'Get Watchdog Stats' })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiOkResponse({ type: GetWatchdogResponse })
  @Auth()
  public async getWatchdog() {
    const watchdog = await this.hypixelService.getWatchdog();

    return {
      success: !!watchdog,
      watchdog,
    };
  }

  @Get(`/gamecounts`)
  @ApiOperation({ summary: 'Get Hypixel Gamecounts' })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiOkResponse({ type: GetGamecountsResponse })
  @Auth()
  public async getGamecounts() {
    const gamecounts = await this.hypixelService.getGamecounts();

    return {
      success: !!gamecounts,
      gamecounts,
    };
  }
}
