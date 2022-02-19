import { CachedPlayerDto, FriendDto, UuidDto } from '#dtos';
import { HypixelService } from '#hypixel/hypixel.service';
import {
  ErrorResponse,
  GetFriendsResponse,
  GetPlayerResponse,
  GetRankedSkyWarsResponse,
  GetRecentGamesResponse,
  GetStatusResponse,
} from '#responses';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';

@ApiTags('players')
@Controller('/player')
export class PlayerController {
  public constructor(
    private readonly playerService: PlayerService,
    private readonly hypixelService: HypixelService
  ) {}

  @ApiOperation({ summary: 'Get a Player' })
  @ApiOkResponse({ type: GetPlayerResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Get()
  public async getPlayer(@Query() { player: tag, cache }: CachedPlayerDto) {
    const player = await this.playerService.findOne(tag, cache);

    return {
      success: !!player,
      player,
    };
  }

  @ApiOperation({ summary: 'Get the Recent Games of a Player' })
  @ApiOkResponse({ type: GetRecentGamesResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Get('/recentgames')
  public async getRecentGames(@Query() { uuid }: UuidDto) {
    const games = await this.hypixelService.getRecentGames(uuid);

    return {
      success: !!games.length,
      games,
    };
  }

  @ApiOperation({ summary: 'Get the Status of a Player' })
  @ApiOkResponse({ type: GetStatusResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Get('/status')
  public async getStatus(@Query() { uuid }: UuidDto) {
    const status = await this.hypixelService.getStatus(uuid);

    return {
      success: !!status,
      status,
    };
  }

  @ApiOperation({ summary: 'Get the Friends of a Player' })
  @ApiOkResponse({ type: GetFriendsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Get('/friends')
  public async getFriends(@Query() { player: tag, page }: FriendDto) {
    const friends = await this.playerService.findFriends(tag, page);

    return {
      success: !!friends,
      friends,
    };
  }

  @ApiOperation({ summary: 'Get the Ranked SkyWars rating and position of a Player' })
  @ApiOkResponse({ type: GetRankedSkyWarsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Get('/rankedskywars')
  public async getRankedSkyWars(@Query() { uuid }: UuidDto) {
    const rankedSkyWars = await this.hypixelService.getRankedSkyWars(uuid);

    return {
      success: !!rankedSkyWars,
      rankedSkyWars,
    };
  }
}
