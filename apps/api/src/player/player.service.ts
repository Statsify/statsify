import { InjectModel } from '@m8a/nestjs-typegoose';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  HypixelCache,
  PlayerNotFoundException,
  RankedSkyWarsNotFoundException,
  RecentGamesNotFoundException,
  StatusNotFoundException,
} from '@statsify/api-client';
import {
  Achievements,
  deserialize,
  Friends,
  LeaderboardScanner,
  Player,
  serialize,
} from '@statsify/schemas';
import { Flatten, flatten } from '@statsify/util';
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
  public async get(
    tag: string,
    cacheLevel: HypixelCache,
    selector?: Record<string, boolean>
  ): Promise<Player | null> {
    const mongoPlayer = await this.findMongoDocument(tag, selector);

    if (mongoPlayer && this.hypixelService.shouldCache(mongoPlayer.expiresAt, cacheLevel)) {
      return this.resolveCachedDocument(mongoPlayer, selector);
    }

    const player = await this.hypixelService.getPlayer(mongoPlayer?.uuid ?? tag);

    if (player) {
      player.expiresAt = Date.now() + 120000;
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
   * @param cacheLevel What type of data to return (cached/live)
   * @returns null or an object containing an array of friends
   */
  public async getFriends(tag: string, cacheLevel: HypixelCache) {
    const player = await this.get(tag, HypixelCache.CACHE_ONLY, {
      displayName: true,
      uuid: true,
    });

    if (!player) throw new PlayerNotFoundException();

    const cachedFriends = await this.friendsModel
      .findOne()
      .where('uuid')
      .equals(player.uuid)
      .lean()
      .exec();

    if (cachedFriends) {
      cachedFriends.cached = true;

      if (this.hypixelService.shouldCache(cachedFriends.expiresAt, cacheLevel))
        return cachedFriends;
    }

    const friends = await this.hypixelService.getFriends(player.uuid);

    if (!friends) {
      if (cachedFriends) return cachedFriends;
      throw new NotFoundException('friends');
    }

    friends.displayName = player.displayName;
    friends.uuid = player.uuid;
    friends.expiresAt = Date.now() + 3_600_000;

    await this.friendsModel
      .replaceOne({ uuid: player.uuid }, friends, { upsert: true })
      .lean()
      .exec();

    return friends;
  }

  public async getAchievements(tag: string) {
    const [player, resources] = await Promise.all([
      this.get(tag, HypixelCache.CACHE, {
        uuid: true,
        displayName: true,
        oneTimeAchievements: true,
        tieredAchievements: true,
        goldAchievements: true,
        expiresAt: true,
      }),
      this.hypixelService.getResources('achievements'),
    ]);

    if (!player) throw new PlayerNotFoundException();

    if (!resources)
      throw new InternalServerErrorException('hypixel achievement resources not found');

    return {
      uuid: player.uuid,
      displayName: player.displayName,
      goldAchievements: player.goldAchievements ?? false,
      achievements: new Achievements(player, resources.achievements),
    };
  }

  public async getStatus(tag: string) {
    const player = await this.get(tag, HypixelCache.CACHE_ONLY, {
      uuid: true,
      displayName: true,
      status: true,
    });

    if (!player) throw new NotFoundException('player');

    const status = await this.hypixelService.getStatus(player.uuid);

    if (!status) throw new StatusNotFoundException(player);

    status.displayName = player.displayName;
    status.uuid = player.uuid;
    status.actions = player.status;

    return status;
  }

  public async getRecentGames(tag: string) {
    const player = await this.get(tag, HypixelCache.CACHE_ONLY, {
      uuid: true,
      displayName: true,
    });

    if (!player) throw new PlayerNotFoundException();

    const games = await this.hypixelService.getRecentGames(player.uuid);

    if (!games) throw new RecentGamesNotFoundException(player);

    return {
      uuid: player.uuid,
      displayName: player.displayName,
      games,
    };
  }

  public async getRankedSkyWars(tag: string) {
    const player = await this.get(tag, HypixelCache.CACHE_ONLY, {
      uuid: true,
      displayName: true,
    });

    if (!player) throw new PlayerNotFoundException();

    const ranked = await this.hypixelService.getRankedSkyWars(player.uuid);

    if (!ranked) throw new RankedSkyWarsNotFoundException(player);

    ranked.uuid = player.uuid;
    ranked.displayName = player.displayName;

    return ranked;
  }

  /**
   *
   * @param tag UUID or Username of the player
   * @description Deletes a player from mongo and redis
   */
  public async delete(tag: string) {
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
    selector: Record<string, boolean> = {}
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

  private async resolveCachedDocument(
    mongoPlayer: Flatten<Player>,
    selector?: Record<string, boolean>
  ) {
    let redisSelector: string[] | undefined = undefined;

    //If a selector is provided only query the keys whose values are truthy
    if (selector) {
      redisSelector = Object.keys(selector).filter((key) => selector[key]);
    } else {
      redisSelector = LeaderboardScanner.getLeaderboardFields(Player);
    }

    //Only select keys that are not in the mongo document
    redisSelector = redisSelector.filter((key) => !(key in mongoPlayer));

    const redisPlayer = await this.leaderboardService.getLeaderboardDocument(
      Player,
      mongoPlayer.shortUuid,
      redisSelector
    );

    return deserialize(Player, {
      ...redisPlayer,
      ...mongoPlayer,
    });
  }
}
