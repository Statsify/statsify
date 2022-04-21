import { ApiProperty } from '@nestjs/swagger';

class PlayerLeaderboardItem {
  @ApiProperty()
  public uuid: string;

  @ApiProperty({ description: 'The main stat being requested' })
  public field: number;

  @ApiProperty({
    description:
      "The player's formatted name, it also includes prefixes like bedwars star or duels title",
  })
  public name: string;

  @ApiProperty({
    type: [Number],
    description:
      'Additional stats that are also provided for the provided stat. For example if you request `kills` you will also receive `deaths` and `kdr`',
  })
  public additionalFields: number[];

  @ApiProperty()
  public position: number;
}

export class PostPlayerLeaderboardResponse {
  @ApiProperty({ description: 'The name of the requested leaderboard' })
  public fieldName: string;

  @ApiProperty({ type: [String], description: 'The names of the additional fields' })
  public additionalFieldNames: string[];

  @ApiProperty({ type: [PlayerLeaderboardItem] })
  public data: PlayerLeaderboardItem[];
}
