import { Body, Controller, Post, Response } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { Auth } from '../../auth';
import { PlayerLeaderboardDto } from '../../dtos/player-leaderboard.dto';
import { PlayerRankingsDto } from '../../dtos/player-rankings.dto';
import {
  ErrorResponse,
  PostPlayerLeaderboardResponse,
  PostPlayerRankingsResponse,
} from '../../responses';
import { PlayerKeys } from '../player.select';
import { PlayerLeaderboardService } from './player-leaderboard.service';

@Controller('/player/leaderboards')
export class PlayerLeaderboardsController {
  public constructor(private readonly playerLeaderboardService: PlayerLeaderboardService) {}

  @Post()
  @ApiOperation({ summary: 'Get a Player Leaderboard' })
  @ApiOkResponse({ type: PostPlayerLeaderboardResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 3 })
  public async getPlayerLeaderboard(
    @Body() { field, page, uuid }: PlayerLeaderboardDto,
    @Response({ passthrough: true }) res: FastifyReply
  ) {
    const leaderboard = await this.playerLeaderboardService.getLeaderboard(
      field as PlayerKeys,
      uuid ?? page
    );

    if (!leaderboard) {
      res.status(400);

      return {
        statusCode: 400,
        message: ['Provided player has no rankings'],
        error: 'Bad Request',
      };
    }

    return leaderboard;
  }

  @Post('/rankings')
  @ApiOperation({ summary: 'Get a Player Rankings' })
  @ApiOkResponse({ type: [PostPlayerRankingsResponse] })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 5 })
  public async getPlayerRankings(@Body() { fields, uuid }: PlayerRankingsDto) {
    return this.playerLeaderboardService.getLeaderboardRankings(fields as PlayerKeys[], uuid);
  }
}
