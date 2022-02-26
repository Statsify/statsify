import { ApiProperty } from '@nestjs/swagger';

export class PostPlayerRankingsResponse {
  @ApiProperty({ description: 'The name of the requested ranking' })
  public fieldName: string;

  @ApiProperty()
  public rank: number;
}
