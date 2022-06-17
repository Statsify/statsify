import { ApiProperty } from '@nestjs/swagger';
import { Guild, LeaderboardScanner } from '@statsify/schemas';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

const fields = LeaderboardScanner.getLeaderboardFields(Guild);

export class GuildRankingDto {
  @ApiProperty({ enum: fields, type: [String] })
  @IsEnum(fields, { each: true })
  public fields: string[];

  @IsString()
  @MinLength(24)
  @MaxLength(24)
  @ApiProperty()
  public id: string;
}
