import { ApiProperty } from '@nestjs/swagger';
import { getLeaderboardFields, Player } from '@statsify/schemas';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';

const fields = getLeaderboardFields(new Player({}));

export class LeaderboardDto {
  @IsEnum(fields)
  @ApiProperty({ enum: fields })
  public field: string;

  @Transform((params) => +params.value)
  @IsInt()
  @Min(0)
  @ApiProperty({ default: 0, minimum: 0, type: () => Number })
  public page = 0;
}
