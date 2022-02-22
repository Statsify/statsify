import { ApiProperty, PartialType } from '@nestjs/swagger';
import { getLeaderboardFields, Player } from '@statsify/schemas';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';
import { UuidDto } from './uuid.dto';

const fields = getLeaderboardFields(new Player({}));

export class LeaderboardDto extends PartialType(UuidDto) {
  @IsEnum(fields)
  @ApiProperty({ enum: fields })
  public field: string;

  @Transform((params) => +params.value)
  @IsInt()
  @Min(0)
  @ApiProperty({ default: 0, minimum: 0, type: () => Number })
  public page = 0;
}
