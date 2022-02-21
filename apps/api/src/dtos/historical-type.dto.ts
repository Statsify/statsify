import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { HistoricalType } from '../historical';

export class HistoricalTypeDto {
  @ApiProperty({
    enum: HistoricalType,
    enumName: 'HistoricalType',
    example: HistoricalType.DAILY,
    description: 'Determines whether to send daily, weekly, or monthly data.',
  })
  @IsEnum(HistoricalType)
  public type: HistoricalType;
}
