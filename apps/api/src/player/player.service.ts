import { HypixelCache } from '#hypixel/cache.enum';
import { HypixelService } from '#hypixel/hypixel.service';
import { LeaderboardService } from '#leaderboards/leaderboard.service';
import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable } from '@nestjs/common';
import { deserialize, Friends, Player, serialize } from '@statsify/schemas';
import type { ReturnModelType } from '@typegoose/typegoose';
import short from 'short-uuid';
import { PlayerSelection, PlayerSelector } from './player.select';
@Injectable()
export class PlayerService {
  public constructor(
    private readonly hypixelService: HypixelService,
    private readonly leaderboardService: LeaderboardService,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>,
    @InjectModel(Friends) private readonly friendsModel: ReturnModelType<typeof Friends>
  ) {}

  /**
   *
   * @param tag UUID or username
   * @param cacheLevel What type of data to return (cached/live)
   * @param selector (optional) A mongo selector to select specific fields
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

    const player = await this.hypixelService.getPlayer(cachedPlayer?.uuid ?? tag);

    if (player) {
      player.expiresAt = Date.now() + 300000;
      player.leaderboardBanned = cachedPlayer?.leaderboardBanned ?? false;
      player.resetMinute = cachedPlayer?.resetMinute;

      const uuid = player.uuid;

      player.uuid = short(short.constants.cookieBase90).fromUUID(uuid);

      this.leaderboardService.addLeaderboards(Player, player, 'uuid', player.leaderboardBanned);

      player.uuid = uuid;

      const doc = this.serialize(player);

      await this.playerModel.replaceOne({ uuid }, doc, { upsert: true });

      return this.deserialize(player);
    }

    return cachedPlayer ?? null;
  }

  /**
   *
   * @param tag UUID or username
   * @param page The page of friends to return
   * @returns null or an object containing an array of friends
   */
  public async findFriends(tag: string, page: number) {
    const player = await this.findOne(tag, HypixelCache.CACHE_ONLY, {
      displayName: true,
      uuid: true,
    });

    if (!player) return null;

    const cachedFriends = await this.friendsModel
      .findOne()
      .where('uuid')
      .equals(player.uuid)
      .lean()
      .exec();

    const pageSize = 8;

    const friends = await this.hypixelService.getFriends(player.uuid);

    if (!friends) return null;

    const friendMap = Object.fromEntries(
      (cachedFriends?.friends ?? []).map((friend) => [friend.uuid, friend])
    );

    const pageMin = page * pageSize;
    const pageMax = pageMin + pageSize;

    //Loop through all the friends to make sure data to retained in mongo
    for (let i = 0; i < friends.friends.length; i++) {
      const friend = friends.friends[i];
      const cachedFriend = friendMap[friend.uuid];

      const inPageRange = i >= pageMin && i < pageMax;

      if (cachedFriend && cachedFriend.displayName) {
        friend.displayName = cachedFriend.displayName;
        friend.expiresAt = cachedFriend.expiresAt;
      }

      //If they are not in the page range don't bother requesting them
      if (!inPageRange) continue;

      //Only request friend data if there is no cached data or the cache is expired
      if (
        !cachedFriend ||
        !this.hypixelService.shouldCache(cachedFriend.expiresAt, HypixelCache.CACHE)
      ) {
        const friendData = await this.findOne(friend.uuid, HypixelCache.CACHE_ONLY, {
          displayName: true,
        });

        friend.displayName = friendData ? friendData.displayName : `Error ${friend.uuid}`;

        friend.expiresAt = Date.now() + 86400000;
      }
    }

    await this.friendsModel
      .replaceOne({ uuid: player.uuid }, friends, { upsert: true })
      .lean()
      .exec();

    friends.displayName = player.displayName;
    friends.friends = friends.friends.slice(pageMin, pageMax);

    return friends;
  }

  public serialize(instance: Player) {
    return serialize(Player, instance);
  }

  public deserialize(data: Player) {
    return deserialize(new Player(), data);
  }
}
