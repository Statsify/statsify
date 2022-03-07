import { ApiProperty } from '@nestjs/swagger';
import { Achievements } from '@statsify/schemas';
import { SuccessResponse } from './success.response';

export class GetAchievementsResponse extends SuccessResponse {
  @ApiProperty()
  public uuid: string;

  @ApiProperty()
  public displayName: string;

  @ApiProperty()
  public goldAchievements: boolean;

  @ApiProperty()
  public achievements: Achievements;
}
