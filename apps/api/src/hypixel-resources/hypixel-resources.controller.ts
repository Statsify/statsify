import { HypixelService } from '#hypixel/hypixel.service';
import { ErrorResponse, GetGamecountsResponse, GetWatchdogResponse } from '#responses';
import { Controller, Get } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('hypixel-resources')
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
