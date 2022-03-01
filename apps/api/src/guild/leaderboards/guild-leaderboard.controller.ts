import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GuildLeaderboardDto } from '../../dtos';
import { ErrorResponse, PostGuildLeaderboardResponse } from '../../responses';
import { GuildLeaderboardService } from './guild-leaderboard.service';

@Controller('/guild/leaderboards')
export class GuildLeaderboardController {
  public constructor(private readonly guildLeaderboardService: GuildLeaderboardService) {}

  @Post()
  @ApiOperation({ summary: 'Get a Guild Leaderboard' })
  @ApiOkResponse({ type: PostGuildLeaderboardResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  public async getGuildLeaderboard(@Body() { field, page }: GuildLeaderboardDto) {
    return this.guildLeaderboardService.getLeaderboard(field, page);
  }
}
