import { HypixelCache } from '#hypixel/cache.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CacheDto {
  @ApiProperty({
    enum: HypixelCache,
    enumName: 'HypixelCache',
    example: HypixelCache.CACHE,
    default: HypixelCache.CACHE,
    description: 'Describes whether to return live data or cached data.',
    required: false,
  })
  public cache: HypixelCache = HypixelCache.CACHE;
}
