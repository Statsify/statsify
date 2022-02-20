import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { HypixelCache } from '../hypixel';

export class CacheDto {
  @ApiProperty({
    enum: HypixelCache,
    enumName: 'HypixelCache',
    example: HypixelCache.CACHE,
    default: HypixelCache.CACHE,
    description: 'Describes whether to return live data or cached data.',
    required: false,
  })
  @IsOptional()
  @IsEnum(HypixelCache)
  public cache: HypixelCache = HypixelCache.CACHE;
}
