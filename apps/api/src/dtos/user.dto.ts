import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UserDto {
  @ApiProperty({ description: 'Discord ID or UUID' })
  @IsString()
  @MinLength(17)
  @MaxLength(36)
  public tag: string;
}
