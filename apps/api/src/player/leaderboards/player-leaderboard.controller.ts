import { Body, Controller, Post, Response } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { PlayerLeaderboardDto } from '../../dtos/player-leaderboard.dto';
import { PlayerKeys } from '../player.select';
import { PlayerLeaderboardService } from './player-leaderboard.service';

@Controller('/player/leaderboards')
export class PlayerLeaderboardsController {
  public constructor(private readonly playerLeaderboardService: PlayerLeaderboardService) {}

  @Post()
  @ApiOperation({ summary: 'Get a Player Leaderboard' })
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
}
