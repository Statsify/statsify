/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Body, Controller, Post, Response } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  ErrorResponse,
  PostGuildLeaderboardResponse,
  PostGuildRankingsResponse,
} from '@statsify/api-client';
import type { FastifyReply } from 'fastify';
import { Auth } from '../../auth';
import { GuildLeaderboardDto, GuildRankingDto } from '../../dtos';
import { GuildLeaderboardService } from './guild-leaderboard.service';

@Controller('/guild/leaderboards')
export class GuildLeaderboardController {
  public constructor(private readonly guildLeaderboardService: GuildLeaderboardService) {}

  @Post()
  @ApiOperation({ summary: 'Get a Guild Leaderboard', tags: ['Guild Leaderboards'] })
  @ApiOkResponse({ type: PostGuildLeaderboardResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 10 })
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
  @ApiOperation({ summary: 'Get a Guild Ranking', tags: ['Guild Leaderboards'] })
  @ApiOkResponse({ type: PostGuildRankingsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 3 })
  public async getGuildRanking(@Body() { field, name }: GuildRankingDto) {
    return this.guildLeaderboardService.getLeaderboardRanking(field, name);
  }
}
