import { ApiProperty } from '@nestjs/swagger';
import { RecentGames } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetRecentGamesResponse extends SuccessResponse {
  @ApiProperty()
  public recentGames: RecentGames;
}
