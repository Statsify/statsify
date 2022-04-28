import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { HistoricalType } from '../historical';
import { PlayerDto } from './player.dto';

export class HistoricalDto extends PlayerDto {
  @ApiProperty({
    enum: HistoricalType,
    enumName: 'HistoricalType',
    example: HistoricalType.DAILY,
    description: 'Determines whether to send daily, weekly, or monthly data.',
  })
  @IsEnum(HistoricalType)
  public type: HistoricalType;
}
