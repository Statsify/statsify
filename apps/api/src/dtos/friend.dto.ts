import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { PlayerDto } from './player.dto';

export class FriendDto extends PlayerDto {
  @Transform((params) => +params.value)
  @IsInt()
  @Min(0)
  @Max(3400)
  @ApiProperty({ description: 'What page of friends to get', minimum: 0, maximum: 3400 })
  public page: number;
}
