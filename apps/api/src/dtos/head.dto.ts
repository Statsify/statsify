import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { UuidDto } from './uuid.dto';

export class HeadDto extends UuidDto {
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsInt()
  @Min(8)
  @Max(800)
  @ApiProperty({ description: 'The size of the head', default: 160, minimum: 8, maximum: 800 })
  public size = 160;
}
