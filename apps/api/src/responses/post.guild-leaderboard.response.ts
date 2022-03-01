import { ApiProperty } from '@nestjs/swagger';

class GuildLeaderboardItem {
  @ApiProperty({ description: 'The main stat being requested' })
  public field: number;

  @ApiProperty({
    description: "The guild's formatted name with tag",
  })
  public name: string;

  @ApiProperty({
    type: [Number],
    description: 'Additional stats that are also provided for the provided stat. Like `level`',
  })
  public additionalFields: number[];

  @ApiProperty()
  public position: number;
}

export class PostGuildLeaderboardResponse {
  @ApiProperty()
  public fieldName: string;

  @ApiProperty({ type: [String] })
  public additionalFieldNames: string[];

  @ApiProperty({ type: [GuildLeaderboardItem] })
  public data: GuildLeaderboardItem[];
}
