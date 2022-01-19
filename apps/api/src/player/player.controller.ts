import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Player } from '@statsify/schemas';
import { HypixelCache } from '../hypixel/cache.enum';
import { PlayerService } from './player.service';

@Controller('/player')
export class PlayerController {
  public constructor(private readonly playerService: PlayerService) {}

  @ApiOperation({ summary: 'Get a Player', tags: ['player'] })
  @ApiOkResponse({ type: Player })
  @Get()
  public async getPlayer(@Query('player') tag: string) {
    const player = await this.playerService.findOne(tag, HypixelCache.LIVE);

    return {
      success: !!player,
      player,
    };
  }
}
