import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { CacheDto } from './cache.dto';

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

export class UuidDto {
  @IsString()
  @MaxLength(36)
  @MinLength(32)
  @ApiProperty()
  public uuid: string;
}

export class CachedPlayerDto extends IntersectionType(PlayerDto, CacheDto) {}

export class FriendDto extends PlayerDto {
  @Transform((params) => +params.value)
  @IsInt()
  @Min(0)
  @Max(3400)
  @ApiProperty({
    description: 'What page of friends to get',
  })
  public page: number;
}
