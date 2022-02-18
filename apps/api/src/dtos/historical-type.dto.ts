import { HistoricalType } from '#historical/historical-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

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
