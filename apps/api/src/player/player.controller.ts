import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Player } from '@statsify/schemas';
import { PlayerService } from './player.service';

@Controller('/player')
export class PlayerController {
  public constructor(private readonly playerService: PlayerService) {}

  @ApiOperation({ summary: 'Get a Player', tags: ['player'] })
  @ApiOkResponse({ type: Player })
  @Get()
  public async getPlayer(@Query('player') tag: string) {
    return this.playerService.deserialize(new Player());
  }
}
