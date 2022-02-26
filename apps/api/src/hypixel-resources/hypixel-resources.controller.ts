import { Controller, Get } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { HypixelService } from '../hypixel';
import { ErrorResponse, GetGamecountsResponse, GetWatchdogResponse } from '../responses';

@Controller(`/hypixelresources`)
export class HypixelResourcesController {
  public constructor(private readonly hypixelService: HypixelService) {}

  @Get(`/watchdog`)
  @ApiOperation({ summary: 'Get Watchdog Stats' })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiOkResponse({ type: GetWatchdogResponse })
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
  public async getGamecounts() {
    const gamecounts = await this.hypixelService.getGamecounts();

    return {
      success: !!gamecounts,
      gamecounts,
    };
  }
}
