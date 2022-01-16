import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable } from '@nestjs/common';
import { Player } from '@statsify/schemas';
import type { ReturnModelType } from '@typegoose/typegoose';
import { HypixelCache } from '../hypixel/cache.enum';
import { HypixelService } from '../hypixel/hypixel.service';

@Injectable()
export class PlayerService {
  public constructor(
    private readonly hypixelService: HypixelService,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>
  ) {}

  /**
   *
   * @param tag uuid or username
   */
  public async findOne(tag: string, cacheLevel: HypixelCache) {
    const type = tag.length > 16 ? 'uuid' : 'usernameToLower';

    const cachedPlayer = await this.playerModel
      .findOne()
      .where(type)
      .equals(tag.replace(/-/g, '').toLowerCase())
      .lean()
      .exec();

    if (
      cachedPlayer &&
      ((Date.now() < cachedPlayer.expiresAt && cacheLevel === HypixelCache.CACHE) ||
        cacheLevel === HypixelCache.CACHE_ONLY)
    ) {
      return {
        ...cachedPlayer,
        cached: true,
      };
    }

    const player = await this.hypixelService.getPlayer(tag);

    if (player) {
      return player;
    }

    return cachedPlayer ?? null;
  }
}
