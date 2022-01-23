import { HypixelService } from '#hypixel/hypixel.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Watchdog } from '@statsify/schemas';

@ApiTags('hypixel-resources')
@Controller(`/hypixelresources`)
export class HypixelResourcesController {
  public constructor(private readonly hypixelService: HypixelService) {}

  @Get(`/watchdog`)
  @ApiOperation({ summary: 'Get Watchdog Stats' })
  @ApiOkResponse({ type: Watchdog })
  public async getWatchdog() {
    const watchdog = await this.hypixelService.getWatchdog();

    return {
      success: !!watchdog,
      watchdog,
    };
  }
}
