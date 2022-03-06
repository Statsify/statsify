import { Body, Controller, Post, Response } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { GuildLeaderboardDto, GuildRankingDto } from '../../dtos';
import {
  ErrorResponse,
  PostGuildLeaderboardResponse,
  PostGuildRankingsResponse,
} from '../../responses';
import { GuildLeaderboardService } from './guild-leaderboard.service';

@Controller('/guild/leaderboards')
export class GuildLeaderboardController {
  public constructor(private readonly guildLeaderboardService: GuildLeaderboardService) {}

  @Post()
  @ApiOperation({ summary: 'Get a Guild Leaderboard' })
  @ApiOkResponse({ type: PostGuildLeaderboardResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  public async getGuildLeaderboard(
    @Body() { field, page, name }: GuildLeaderboardDto,
    @Response({ passthrough: true }) res: FastifyReply
  ) {
    const leaderboard = await this.guildLeaderboardService.getLeaderboard(field, name ?? page);

    if (!leaderboard) {
      res.status(400);

      return {
        statusCode: 400,
        message: ['Provided guild has no rankings'],
        error: 'Bad Request',
      };
    }

    return leaderboard;
  }

  @Post('/rankings')
  @ApiOperation({ summary: 'Get a Guild Ranking' })
  @ApiOkResponse({ type: PostGuildRankingsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  public async getGuildRanking(@Body() { field, name }: GuildRankingDto) {
    return this.guildLeaderboardService.getLeaderboardRanking(field, name);
  }
}
