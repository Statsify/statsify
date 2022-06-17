import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  ErrorResponse,
  LeaderboardQuery,
  PostLeaderboardRankingsResponse,
  PostLeaderboardResponse,
} from '@statsify/api-client';
import { Guild } from '@statsify/schemas';
import { Auth } from '../../auth';
import { GuildLeaderboardDto, GuildRankingDto } from '../../dtos';
import { GuildLeaderboardService } from './guild-leaderboard.service';

@Controller('/guild/leaderboards')
export class GuildLeaderboardController {
  public constructor(private readonly guildLeaderboardService: GuildLeaderboardService) {}

  @Post()
  @ApiOperation({ summary: 'Get a Guild Leaderboard', tags: ['Guild Leaderboards'] })
  @ApiOkResponse({ type: PostLeaderboardResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 10 })
  public async getGuildLeaderboard(@Body() { field, page, id, position }: GuildLeaderboardDto) {
    let input: number | string;
    let type: LeaderboardQuery;

    if (id) {
      input = id;
      type = LeaderboardQuery.INPUT;
    } else if (position) {
      input = position;
      type = LeaderboardQuery.POSITION;
    } else {
      input = page;
      type = LeaderboardQuery.PAGE;
    }

    const leaderboard = await this.guildLeaderboardService.getLeaderboard(
      Guild,
      field,
      input,
      type
    );

    return leaderboard;
  }

  @Post('/rankings')
  @ApiOperation({ summary: 'Get a Guild Ranking', tags: ['Guild Leaderboards'] })
  @ApiOkResponse({ type: [PostLeaderboardRankingsResponse] })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @Auth({ weight: 3 })
  public async getGuildRanking(@Body() { fields, id }: GuildRankingDto) {
    return this.guildLeaderboardService.getLeaderboardRankings(Guild, fields, id);
  }
}
