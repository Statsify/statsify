import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable } from '@nestjs/common';
import { deserialize, Player, serialize } from '@statsify/schemas';
import type { ReturnModelType } from '@typegoose/typegoose';
import { HypixelCache } from '../hypixel/cache.enum';
import { HypixelService } from '../hypixel/hypixel.service';
import { PlayerSelection, PlayerSelector } from './player.select';

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
  public async findOne<T extends PlayerSelector>(
    tag: string,
    cacheLevel: HypixelCache,
    selector: T
  ): Promise<PlayerSelection<T> | null>;
  public async findOne(tag: string, cacheLevel: HypixelCache): Promise<Player | null>;
  public async findOne<T extends PlayerSelector>(
    tag: string,
    cacheLevel: HypixelCache,
    selector?: T
  ): Promise<Player | PlayerSelection<T> | null> {
    const type = tag.length > 16 ? 'uuid' : 'usernameToLower';

    let cachedPlayer: Player | null = await this.playerModel
      .findOne()
      .where(type)
      .equals(tag.replace(/-/g, '').toLowerCase())
      .select(selector)
      .lean()
      .exec();

    if (cachedPlayer) {
      cachedPlayer = this.deserialize(cachedPlayer);
      cachedPlayer.cached = true;
    }

    if (cachedPlayer && this.hypixelService.shouldCache(cachedPlayer.expiresAt, cacheLevel)) {
      return cachedPlayer;
    }

    const player = await this.hypixelService.getPlayer(tag);

    if (player) {
      player.expiresAt = Date.now() + 300000;

      const doc = this.serialize(player);

      await this.playerModel.replaceOne({ uuid: player.uuid }, doc, { upsert: true });

      return this.deserialize(player);
    }

    return cachedPlayer ?? null;
  }

  public serialize(instance: Player) {
    return serialize(Player, instance);
  }

  public deserialize(data: Player) {
    return deserialize(new Player(), data);
  }
}
