import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { CacheDto } from './cache.dto';

export enum GuildQueryType {
  ID = 'ID',
  NAME = 'NAME',
  PLAYER = 'PLAYER',
}

export class GuildDto extends CacheDto {
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  @ApiProperty({
    example: 'bluebloods',
    description: "The guild's name or id or a guild member's uuid",
  })
  public guild: string;

  @IsEnum(GuildQueryType)
  @ApiProperty({
    enum: GuildQueryType,
    enumName: 'GuildQueryType',
    example: GuildQueryType.ID,
    description:
      'The way you want to query the guild, either search by the name, the uuid of a guild member or the guild id',
  })
  public type: GuildQueryType;
}
