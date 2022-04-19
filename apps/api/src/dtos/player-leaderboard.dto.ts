import { ApiProperty, PartialType } from '@nestjs/swagger';
import { LeaderboardScanner, Player } from '@statsify/schemas';
import { FlattenKeys } from '@statsify/util';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';
import { UuidDto } from './uuid.dto';

const fields = LeaderboardScanner.getLeaderboardFields(Player);

export class PlayerLeaderboardDto extends PartialType(UuidDto) {
  @IsEnum(fields)
  @ApiProperty({ enum: fields })
  public field: FlattenKeys<Player>;

  @Transform((params) => +params.value)
  @IsInt()
  @Min(0)
  @ApiProperty({ default: 0, minimum: 0, type: () => Number })
  public page = 0;
}
