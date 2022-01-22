import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable } from '@nestjs/common';
import { deserialize, Player, serialize } from '@statsify/schemas';
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

    let cachedPlayer = (await this.playerModel
      .findOne()
      .where(type)
      .equals(tag.replace(/-/g, '').toLowerCase())
      .lean()
      .exec()) as Player;

    if (cachedPlayer) {
      cachedPlayer = this.deserialize(cachedPlayer);
    }

    if (cachedPlayer && this.hypixelService.shouldCache(cachedPlayer.expiresAt, cacheLevel)) {
      return {
        ...cachedPlayer,
        cached: true,
      };
    }

    const player = await this.hypixelService.getPlayer(tag);

    if (player) {
      player.expiresAt = Date.now() + 300000;

      const doc = this.serialize(player);

      await this.playerModel.replaceOne({ uuid: player.uuid }, doc, { upsert: true });

      return this.deserialize(player);
    }

    return cachedPlayer ? { ...cachedPlayer, cached: true } : null;
  }

  public serialize(instance: Player) {
    return serialize(Player, instance);
  }

  public deserialize(data: Player) {
    return deserialize(new Player(), data);
  }
}
