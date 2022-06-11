import { Body, Controller, Post, Response } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ErrorResponse,
  LeaderboardQuery,
  PostPlayerLeaderboardResponse,
  PostPlayerRankingsResponse,
} from '@statsify/api-client';
import type { FastifyReply } from 'fastify';
import { Auth } from '../../auth';
import { PlayerLeaderboardDto } from '../../dtos/player-leaderboard.dto';
import { PlayerRankingsDto } from '../../dtos/player-rankings.dto';
import { PlayerLeaderboardService } from './player-leaderboard.service';

@Controller('/player/leaderboards')
@ApiTags('Player Leaderboards')
export class PlayerLeaderboardsController {
  public constructor(private readonly playerLeaderboardService: PlayerLeaderboardService) {}

  @Post()
  @ApiOperation({ summary: 'Get a Player Leaderboard' })
  @ApiOkResponse({ type: PostPlayerLeaderboardResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 3 })
  public async getPlayerLeaderboard(
    @Body() { field, page, player, position }: PlayerLeaderboardDto,
    @Response({ passthrough: true }) res: FastifyReply
  ) {
    let input: number | string;
    let type: LeaderboardQuery;

    if (player) {
      input = player;
      type = LeaderboardQuery.PLAYER;
    } else if (position) {
      input = position;
      type = LeaderboardQuery.POSITION;
    } else {
      input = page;
      type = LeaderboardQuery.PAGE;
    }

    const leaderboard = await this.playerLeaderboardService.getLeaderboard(field, input, type);

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
    return this.playerLeaderboardService.getLeaderboardRankings(fields, uuid);
  }
}
