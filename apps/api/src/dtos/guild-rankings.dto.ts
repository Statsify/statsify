import { ApiProperty } from '@nestjs/swagger';
import { getLeaderboardFields, Guild } from '@statsify/schemas';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

const fields = getLeaderboardFields(new Guild({}));

export class GuildRankingDto {
  @IsEnum(fields)
  @ApiProperty({ enum: fields })
  public field: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @ApiProperty()
  public name: string;
}
