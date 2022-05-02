import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable } from '@nestjs/common';
import { HypixelCache } from '@statsify/api-client';
import {
  Achievements,
  deserialize,
  Friends,
  LeaderboardScanner,
  Player,
  Selector,
  serialize,
} from '@statsify/schemas';
import { Flatten, flatten, FlattenKeys } from '@statsify/util';
import type { ReturnModelType } from '@typegoose/typegoose';
import short from 'short-uuid';
import { HypixelService } from '../hypixel';
import { LeaderboardService } from '../leaderboards';

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
  public async findOne(
    tag: string,
    cacheLevel: HypixelCache,
    selector?: Selector<Player>
  ): Promise<Player | null> {
    const mongoPlayer = await this.findMongoDocument(tag, selector);

    if (mongoPlayer && this.hypixelService.shouldCache(mongoPlayer.expiresAt, cacheLevel)) {
      return this.resolveCachedDocument(mongoPlayer, selector);
    }

    const player = await this.hypixelService.getPlayer(mongoPlayer?.uuid ?? tag);

    if (player) {
      player.expiresAt = Date.now() + 300000;
      player.leaderboardBanned = mongoPlayer?.leaderboardBanned ?? false;
      player.resetMinute = mongoPlayer?.resetMinute;

      const flatPlayer = flatten(player);

      this.saveOne(flatPlayer);

      return deserialize(Player, flatPlayer);
    } else if (mongoPlayer) {
      return this.resolveCachedDocument(mongoPlayer, selector);
    }

    return null;
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

  public async findAchievements(tag: string) {
    const [player, resources] = await Promise.all([
      this.findOne(tag, HypixelCache.CACHE, {
        uuid: true,
        displayName: true,
        oneTimeAchievements: true,
        tieredAchievements: true,
        goldAchievements: true,
        expiresAt: true,
      }),
      this.hypixelService.getResources('achievements'),
    ]);

    if (!player || !resources) return null;

    return {
      uuid: player.uuid,
      displayName: player.displayName,
      goldAchievements: player.goldAchievements ?? false,
      achievements: new Achievements(player, resources.achievements),
    };
  }

  public async findStatus(tag: string) {
    const player = await this.findOne(tag, HypixelCache.CACHE_ONLY, {
      uuid: true,
      displayName: true,
      status: true,
    });

    if (!player) return null;

    const status = await this.hypixelService.getStatus(player.uuid);

    if (!status) return null;

    status.displayName = player.displayName;
    status.uuid = player.uuid;
    status.actions = player.status;

    return status;
  }

  public async findRecentGames(tag: string) {
    const player = await this.findOne(tag, HypixelCache.CACHE_ONLY, {
      uuid: true,
      displayName: true,
    });

    if (!player) return null;

    const games = await this.hypixelService.getRecentGames(player.uuid);

    if (!games) return null;

    return {
      uuid: player.uuid,
      displayName: player.displayName,
      games,
    };
  }

  public async findRankedSkyWars(tag: string) {
    const player = await this.findOne(tag, HypixelCache.CACHE_ONLY, {
      uuid: true,
      displayName: true,
    });

    if (!player) return null;

    const ranked = await this.hypixelService.getRankedSkyWars(player.uuid);

    if (!ranked) return null;

    ranked.uuid = player.uuid;
    ranked.displayName = player.displayName;

    return ranked;
  }

  /**
   *
   * @param tag UUID or Username of the player
   * @description Deletes a player from mongo and redis
   */
  public async deleteOne(tag: string) {
    const player = await this.findMongoDocument(tag, {});

    if (!player) return null;

    //Remove all sorted sets the player is in
    await this.leaderboardService.addLeaderboards(
      Player,
      player,
      'shortUuid',
      LeaderboardScanner.getLeaderboardFields(Player),
      true
    );

    return true;
  }

  private async findMongoDocument(
    tag: string,
    selector: Selector<Player> = {}
  ): Promise<Flatten<Player> | null> {
    const type = tag.length > 16 ? 'uuid' : 'usernameToLower';

    const mongoPlayer: Player | null = await this.playerModel
      .findOne()
      .where(type)
      .equals(tag.replace(/-/g, '').toLowerCase())
      .select(selector)
      .lean()
      .exec();

    if (!mongoPlayer) return null;

    mongoPlayer.cached = true;

    return flatten(mongoPlayer);
  }

  private async saveOne(player: Flatten<Player>) {
    player.shortUuid = short(short.constants.cookieBase90).fromUUID(player.uuid);

    //Serialize and flatten the player
    const serializedPlayer = serialize(Player, player);

    const fields = LeaderboardScanner.getLeaderboardFields(Player);

    //Remove all leaderboard fields for the mongo document
    fields.forEach((field) => {
      if (serializedPlayer[field]) delete serializedPlayer[field];
    });

    await this.playerModel.replaceOne({ uuid: player.uuid }, serializedPlayer, { upsert: true });

    await this.leaderboardService.addLeaderboards(
      Player,
      player,
      'shortUuid',
      fields,
      player.leaderboardBanned ?? false
    );
  }

  private async resolveCachedDocument(mongoPlayer: Flatten<Player>, selector?: Selector<Player>) {
    let redisSelector: string[] | undefined = undefined;

    //If a selector is provided only query the keys whose values are truthy
    if (selector) {
      redisSelector = Object.keys(selector).filter(
        (key) => selector[key as keyof Selector<Player>]
      );
    } else {
      redisSelector = LeaderboardScanner.getLeaderboardFields(Player);
    }

    //Only select keys that are not in the mongo document
    redisSelector = redisSelector.filter((key) => !(key in mongoPlayer));

    const redisPlayer = await this.leaderboardService.getLeaderboardDocument(
      Player,
      mongoPlayer.shortUuid,
      redisSelector as FlattenKeys<Player>[]
    );

    return deserialize(Player, {
      ...redisPlayer,
      ...mongoPlayer,
    });
  }
}
