import { ApiProperty } from '@nestjs/swagger';
import { getLeaderboardFields, Player } from '@statsify/schemas';
import { IsEnum } from 'class-validator';
import { UuidDto } from './uuid.dto';

const fields = getLeaderboardFields(new Player({}));

export class PlayerRankingsDto extends UuidDto {
  @ApiProperty({ enum: fields, type: [String] })
  @IsEnum(fields, { each: true })
  public fields: string[];
}
