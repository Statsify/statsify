import { IntersectionType } from '@nestjs/swagger';
import { CacheDto } from './cache.dto';
import { PlayerDto } from './player.dto';

export class CachedPlayerDto extends IntersectionType(PlayerDto, CacheDto) {}
