import { ApiProperty } from '@nestjs/swagger';

export class PostGuildRankingsResponse {
  @ApiProperty({ description: 'The name of the requested ranking' })
  public field: string;

  @ApiProperty()
  public rank: number;
}
