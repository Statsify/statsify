import { ApiProperty } from '@nestjs/swagger';

class PlayerLeaderboardItem {
  @ApiProperty()
  public uuid: string;

  @ApiProperty()
  public field: number;

  @ApiProperty()
  public name: string;

  @ApiProperty({ type: [Number] })
  public additionalFields: number[];

  @ApiProperty()
  public position: number;
}

export class PostPlayerLeaderboardResponse {
  @ApiProperty()
  public fieldName: string;

  @ApiProperty({ type: [String] })
  public additionalFieldNames: string[];

  @ApiProperty({ type: [PlayerLeaderboardItem] })
  public data: PlayerLeaderboardItem[];
}
