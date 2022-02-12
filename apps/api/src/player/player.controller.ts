import { CachedPlayerDto } from '#dtos/cached-player.dto';
import { FriendDto } from '#dtos/friend.dto';
import { UuidDto } from '#dtos/uuid.dto';
import { HypixelService } from '#hypixel/hypixel.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Friends, Player, RankedSkyWars, RecentGame, Status } from '@statsify/schemas';
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
  public async getPlayer(@Query() { player: tag, cache }: CachedPlayerDto) {
    const player = await this.playerService.findOne(tag, cache);

    return {
      success: !!player,
      player,
    };
  }

  @ApiOperation({ summary: 'Get the Recent Games of a Player' })
  @ApiOkResponse({ type: [RecentGame] })
  @Get('/recentgames')
  public async getRecentGames(@Query() { uuid }: UuidDto) {
    const games = await this.hypixelService.getRecentGames(uuid);

    return {
      success: !!games.length,
      games,
    };
  }

  @ApiOperation({ summary: 'Get the Status of a Player' })
  @ApiOkResponse({ type: Status })
  @Get('/status')
  public async getStatus(@Query() { uuid }: UuidDto) {
    const status = await this.hypixelService.getStatus(uuid);

    return {
      success: !!status,
      status,
    };
  }

  @ApiOperation({ summary: 'Get the Friends of a Player' })
  @ApiOkResponse({ type: Friends })
  @Get('/friends')
  public async getFriends(@Query() { player: tag, page }: FriendDto) {
    const friends = await this.playerService.findFriends(tag, page);

    return {
      success: !!friends,
      friends,
    };
  }

  @ApiOperation({ summary: 'Get the Ranked SkyWars rating and position of a Player' })
  @ApiOkResponse({ type: RankedSkyWars })
  @Get('/rankedskywars')
  public async getRankedSkyWars(@Query() { uuid }: UuidDto) {
    const rankedSkyWars = await this.hypixelService.getRankedSkyWars(uuid);

    return {
      success: !!rankedSkyWars,
      rankedSkyWars,
    };
  }
}
