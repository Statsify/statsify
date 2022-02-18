import { LeaderboardDto } from '#dtos/leaderboard.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Player } from '@statsify/schemas';
import short from 'short-uuid';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboards')
@Controller('/leaderboards')
export class LeaderboardController {
  public constructor(private readonly leaderboardService: LeaderboardService) {}

  @Post('/player')
  @ApiOperation({ summary: 'Get a Player Leaderboard' })
  public async getPlayerLeaderboard(@Body() { field }: LeaderboardDto) {
    const lb = await this.leaderboardService.getLeaderboard(Player, field, 0, 10);

    const translator = short(short.constants.cookieBase90);
    return lb.map((player) => ({
      ...player,
      uuid: translator.toUUID(player.id),
    }));
  }
}
