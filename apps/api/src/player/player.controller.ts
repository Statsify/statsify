import { Controller, Delete, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  DeletePlayerResponse,
  ErrorResponse,
  GetFriendsResponse,
  GetPlayerResponse,
  GetRecentGamesResponse,
  GetStatusResponse,
  PlayerNotFoundException,
  RecentGamesNotFoundException,
  StatusNotFoundException,
} from '@statsify/api-client';
import { AuthRole } from '../auth';
import { Auth } from '../auth/auth.decorator';
import { CachedPlayerDto } from '../dtos';
import { PlayerDto } from '../dtos/player.dto';
import { PlayerService } from './player.service';

@Controller('/player')
@ApiTags('Player')
export class PlayerController {
  public constructor(private readonly playerService: PlayerService) {}

  @ApiOperation({ summary: 'Get a Player' })
  @ApiOkResponse({ type: GetPlayerResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: PlayerNotFoundException })
  @Auth()
  @Get()
  public async getPlayer(@Query() { player: tag, cache }: CachedPlayerDto) {
    const player = await this.playerService.get(tag, cache);

    if (!player) throw new PlayerNotFoundException();

    return {
      success: !!player,
      player,
    };
  }

  @ApiOperation({ summary: 'Deletes a Player' })
  @ApiOkResponse({ type: DeletePlayerResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ role: AuthRole.ADMIN })
  @Delete()
  public async deletePlayer(@Query() { player }: PlayerDto) {
    const deleted = await this.playerService.delete(player);

    return {
      success: !!deleted,
    };
  }

  @ApiOperation({ summary: 'Get the Recent Games of a Player' })
  @ApiOkResponse({ type: GetRecentGamesResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: RecentGamesNotFoundException })
  @ApiNotFoundResponse({ type: PlayerNotFoundException })
  @Auth()
  @Get('/recentgames')
  public async getRecentGames(@Query() { player: tag }: PlayerDto) {
    const recentGames = await this.playerService.getRecentGames(tag);

    return {
      success: !!recentGames,
      recentGames,
    };
  }

  @ApiOperation({ summary: 'Get the Status of a Player' })
  @ApiOkResponse({ type: GetStatusResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: StatusNotFoundException })
  @ApiNotFoundResponse({ type: PlayerNotFoundException })
  @Auth()
  @Get('/status')
  public async getStatus(@Query() { player: tag }: PlayerDto) {
    const status = await this.playerService.getStatus(tag);

    return {
      success: !!status,
      status,
    };
  }

  @ApiOperation({ summary: 'Get the Friends of a Player' })
  @ApiOkResponse({ type: GetFriendsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiNotFoundResponse({ type: PlayerNotFoundException })
  @Auth({ weight: 10 })
  @Get('/friends')
  public async getFriends(@Query() { player: tag, cache }: CachedPlayerDto) {
    const friends = await this.playerService.getFriends(tag, cache);

    return {
      success: !!friends,
      data: friends,
    };
  }
}
