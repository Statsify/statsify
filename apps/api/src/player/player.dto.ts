import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { CacheDto } from '../hypixel/cache.dto';

export class GetPlayerDto extends CacheDto {
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  @ApiProperty({
    example: 'j4cobi',
    description: "The player's username or uuid",
  })
  public player: string;
}

export class GetWithUuidDto {
  @IsString()
  @MaxLength(36)
  @MinLength(32)
  @ApiProperty()
  public uuid: string;
}
