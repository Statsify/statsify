import { ApiProperty } from '@nestjs/swagger';
import { getLeaderboardFields, Player } from '@statsify/schemas';
import { IsEnum } from 'class-validator';

const fields = getLeaderboardFields(new Player({}));

export class LeaderboardDto {
  @IsEnum(fields)
  @ApiProperty({ enum: fields })
  public field: string;
}
