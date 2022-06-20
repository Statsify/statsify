/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ErrorResponse,
  LeaderboardQuery,
  PostPlayerLeaderboardResponse,
  PostPlayerRankingsResponse,
} from '@statsify/api-client';
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
  public getPlayerLeaderboard(@Body() { field, page, player, position }: PlayerLeaderboardDto) {
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

    return this.playerLeaderboardService.getLeaderboard(field, input, type);
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
