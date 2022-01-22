import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Player, RecentGame, Status } from '@statsify/schemas';
import { HypixelService } from '../hypixel/hypixel.service';
import { GetPlayerDto, GetWithUuidDto } from './player.dto';
import { PlayerService } from './player.service';

@ApiTags('players')
@Controller('/player')
export class PlayerController {
  public constructor(
    private readonly playerService: PlayerService,
    private readonly hypixelService: HypixelService
  ) {}

  @ApiOperation({ summary: 'Get a Player' })
  @ApiOkResponse({ type: Player })
  @Get()
  public async getPlayer(@Query() { player: tag, cache }: GetPlayerDto) {
    const player = await this.playerService.findOne(tag, cache);

    return {
      success: !!player,
      player,
    };
  }

  @ApiOperation({ summary: 'Get the Recent Games of a Player' })
  @ApiOkResponse({ type: [RecentGame] })
  @Get('/recentgames')
  public async getRecentGames(@Query() { uuid }: GetWithUuidDto) {
    const games = await this.hypixelService.getRecentGames(uuid);

    return {
      success: !!games.length,
      games,
    };
  }

  @ApiOperation({ summary: 'Get the Status of a Player' })
  @ApiOkResponse({ type: Status })
  @Get('/status')
  public async getStatus(@Query() { uuid }: GetWithUuidDto) {
    const status = await this.hypixelService.getStatus(uuid);

    return {
      success: !!status,
      status,
    };
  }
}
