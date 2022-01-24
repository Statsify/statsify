import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UuidDto {
  @IsString()
  @MaxLength(36)
  @MinLength(32)
  @ApiProperty()
  public uuid: string;
}
