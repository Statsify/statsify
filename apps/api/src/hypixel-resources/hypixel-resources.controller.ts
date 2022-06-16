import { Controller, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ErrorResponse,
  GetGamecountsResponse,
  GetResourceResponse,
  GetWatchdogResponse,
} from '@statsify/api-client';
import { Auth } from '../auth';
import { ResourceDto } from '../dtos';
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

  @Get(`/resource`)
  @ApiOperation({ summary: 'Get a hypixel resource' })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiOkResponse({ type: GetResourceResponse })
  @Auth()
  public async getHypixelResource(@Query() { path }: ResourceDto) {
    return await this.hypixelService.getResources(path);
  }
}
