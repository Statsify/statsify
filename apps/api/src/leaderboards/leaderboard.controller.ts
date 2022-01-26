import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Player } from '@statsify/schemas';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboards')
@Controller('/leaderboards')
export class LeaderboardController {
  public constructor(private readonly leaderboardService: LeaderboardService) {}

  @Post('/player')
  @ApiOperation({ summary: 'Get a Player Leaderboard' })
  public async getLeaderboard(): Promise<any> {
    return this.leaderboardService.getLeaderboard(Player, 'stats.bedwars.exp', 0, 10);
  }
}
