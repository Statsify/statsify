import { Controller, Delete, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthRole } from '../auth';
import { Auth } from '../auth/auth.decorator';
import { CachedPlayerDto, FriendDto } from '../dtos';
import { PlayerDto } from '../dtos/player.dto';
import { UuidDto } from '../dtos/uuid.dto';
import { HypixelService } from '../hypixel';
import {
  ErrorResponse,
  GetAchievementsResponse,
  GetFriendsResponse,
  GetPlayerResponse,
  GetRankedSkyWarsResponse,
  GetRecentGamesResponse,
  GetStatusResponse,
} from '../responses';
import { SuccessResponse } from '../responses/success.response';
import { PlayerService } from './player.service';

@Controller('/player')
export class PlayerController {
  public constructor(
    private readonly playerService: PlayerService,
    private readonly hypixelService: HypixelService
  ) {}

  @ApiOperation({ summary: 'Get a Player' })
  @ApiOkResponse({ type: GetPlayerResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth()
  @Get()
  public async getPlayer(@Query() { player: tag, cache }: CachedPlayerDto) {
    const player = await this.playerService.findOne(tag, cache);

    return {
      success: !!player,
      player,
    };
  }

  @ApiOperation({ summary: 'Deletes a Player' })
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ role: AuthRole.ADMIN })
  @Delete()
  public async deletePlayer(@Query() { player }: PlayerDto) {
    const deleted = await this.playerService.deleteOne(player);

    return {
      success: !!deleted,
    };
  }

  @ApiOperation({ summary: 'Get the Recent Games of a Player' })
  @ApiOkResponse({ type: GetRecentGamesResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth()
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
  @Auth()
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
  @Auth({ weight: 10 })
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
  @Auth()
  @Get('/rankedskywars')
  public async getRankedSkyWars(@Query() { uuid }: UuidDto) {
    const rankedSkyWars = await this.hypixelService.getRankedSkyWars(uuid);

    return {
      success: !!rankedSkyWars,
      rankedSkyWars,
    };
  }

  @ApiOperation({ summary: 'Get the Achievements of a Player' })
  @ApiOkResponse({ type: GetAchievementsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth()
  @Get('/achievements')
  public async getAchievements(@Query() { player: tag }: PlayerDto) {
    const data = await this.playerService.findAchievements(tag);

    return {
      success: !!data,
      ...data,
    };
  }
}
