import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class PlayerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  @ApiProperty({
    example: 'j4cobi',
    description: "The player's username or uuid",
  })
  public player: string;
}
