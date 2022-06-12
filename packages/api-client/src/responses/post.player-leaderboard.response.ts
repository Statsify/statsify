import { ApiProperty } from '@nestjs/swagger';

class PlayerLeaderboardItem {
  @ApiProperty()
  public uuid: string;

  @ApiProperty({ type: [Number], description: 'The leaderboard fields returned', isArray: true })
  public fields: number[];

  @ApiProperty({
    description:
      "The player's formatted name, it also includes prefixes like bedwars star or duels title",
  })
  public name: string;

  @ApiProperty()
  public position: number;

  @ApiProperty({ required: false, description: 'Whether the player was the searched for player' })
  public highlight?: boolean;
}

export class PostPlayerLeaderboardResponse {
  @ApiProperty({ type: [String], description: 'The name of the requested leaderboard fields' })
  public fields: string[];

  @ApiProperty({ type: [PlayerLeaderboardItem] })
  public data: PlayerLeaderboardItem[];

  @ApiProperty()
  public page: number;

  @ApiProperty()
  public name: string;
}
