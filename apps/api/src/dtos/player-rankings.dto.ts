import { ApiProperty } from '@nestjs/swagger';
import { LeaderboardScanner, Player } from '@statsify/schemas';
import { FlattenKeys } from '@statsify/util';
import { IsEnum } from 'class-validator';
import { UuidDto } from './uuid.dto';

const fields = LeaderboardScanner.getLeaderboardFields(Player);

export class PlayerRankingsDto extends UuidDto {
  @ApiProperty({ enum: fields, type: [String] })
  @IsEnum(fields, { each: true })
  public fields: FlattenKeys<Player>[];
}
