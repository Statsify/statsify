import { ApiProperty } from '@nestjs/swagger';
import { HypixelCache } from './cache.enum';

export class CacheDto {
  @ApiProperty({
    enum: HypixelCache,
    enumName: 'HypixelCache',
    example: HypixelCache.CACHE,
    default: HypixelCache.CACHE,
    description: 'Describes whether to return live data or cached data.',
    required: false,
  })
  public cache?: HypixelCache = HypixelCache.CACHE;
}
