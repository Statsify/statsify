import { ApiProperty } from '@nestjs/swagger';

export class Key {
  @ApiProperty()
  public name: string;

  @ApiProperty()
  public lifetimeRequests: number;

  @ApiProperty()
  public recentRequests: number;

  @ApiProperty()
  public resetTime: number;

  @ApiProperty()
  public limit: number;
}
