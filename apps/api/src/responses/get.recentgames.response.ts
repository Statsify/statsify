import { ApiProperty } from '@nestjs/swagger';
import { RecentGame } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetRecentGamesResponse extends SuccessResponse {
  @ApiProperty({ type: [RecentGame] })
  public games: RecentGame[];
}
