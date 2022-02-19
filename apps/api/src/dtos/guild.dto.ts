import { GuildQuery } from '#guild/guild-query.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { CacheDto } from './cache.dto';

export class GuildDto extends CacheDto {
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  @ApiProperty({
    example: 'bluebloods',
    description: "The guild's name or id or a guild member's uuid",
  })
  public guild: string;

  @IsEnum(GuildQuery)
  @ApiProperty({
    enum: GuildQuery,
    enumName: 'GuildQuery',
    example: GuildQuery.ID,
    description:
      'The way you want to query the guild, either search by the name, the uuid of a guild member or the guild id',
  })
  public type: GuildQuery;
}
