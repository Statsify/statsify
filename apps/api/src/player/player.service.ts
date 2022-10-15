/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, Flatten, flatten } from "@statsify/util";
import { Daily, Monthly, Weekly } from "../historical/models";
import { Friends, Player, deserialize, merge, serialize } from "@statsify/schemas";
import {
  FriendsNotFoundException,
  HistoricalType,
  HypixelCache,
  PlayerNotFoundException,
  RecentGamesNotFoundException,
  StatusNotFoundException,
} from "@statsify/api-client";
import { HypixelService } from "../hypixel";
import { Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { PlayerLeaderboardService } from "./leaderboards/player-leaderboard.service";
import { PlayerSearchService, RedisPlayer } from "./search/player-search.service";
import type { ReturnModelType } from "@typegoose/typegoose";

@Injectable()
export class PlayerService {
  public constructor(
    private readonly hypixelService: HypixelService,
    @Inject(forwardRef(() => PlayerLeaderboardService))
    private readonly playerLeaderboardService: PlayerLeaderboardService,
    private readonly playerSearchService: PlayerSearchService,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>,
    @InjectModel(Friends) private readonly friendsModel: ReturnModelType<typeof Friends>,
    @InjectModel(Daily) private readonly dailyModel: ReturnModelType<typeof Player>,
    @InjectModel(Weekly) private readonly weeklyModel: ReturnModelType<typeof Player>,
    @InjectModel(Monthly) private readonly monthlyModel: ReturnModelType<typeof Player>
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

    if (
      mongoPlayer &&
      this.hypixelService.shouldCache(mongoPlayer.expiresAt, cacheLevel)
    ) {
      return deserialize(Player, mongoPlayer);
    }

    const player = await this.hypixelService.getPlayer(mongoPlayer?.uuid ?? tag);

    if (player) {
      player.expiresAt = Date.now() + 120_000;
      player.leaderboardBanned = mongoPlayer?.leaderboardBanned ?? false;
      player.resetMinute = mongoPlayer?.resetMinute;
      player.guildId = mongoPlayer?.guildId;

      if (mongoPlayer && mongoPlayer.username !== player.username)
        await this.playerSearchService.delete(mongoPlayer.username);

      const flatPlayer = flatten(player);
      await this.saveOne(player, true);

      flatPlayer.isNew = !mongoPlayer;

      return deserialize(Player, flatPlayer);
    } else if (mongoPlayer) {
      return deserialize(Player, mongoPlayer);
    }

    return null;
  }

  public async update(data: APIData) {
    const player = new Player(data);

    const mongoPlayer = await this.findMongoDocument(player.uuid, {
      username: true,
      guildId: true,
      leaderboardBanned: true,
    });

    if (mongoPlayer && mongoPlayer.username !== player.username)
      await this.playerSearchService.delete(mongoPlayer.username);

    player.guildId = mongoPlayer?.guildId;
    player.leaderboardBanned = mongoPlayer?.leaderboardBanned ?? false;
    player.expiresAt = Date.now() + 120_000;

    return this.saveOne(player, false);
  }

  public getPlayers(start: number, end: number) {
    return this.playerLeaderboardService["getLeaderboardFromRedis"](
      Player,
      "stats.general.networkExp",
      start,
      end
    );
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
      .where("uuid")
      .equals(player.uuid)
      .lean()
      .exec();

    if (cachedFriends) {
      cachedFriends.cached = true;

      if (this.hypixelService.shouldCache(cachedFriends.expiresAt, cacheLevel))
        return cachedFriends;
    }

    const friends = await this.hypixelService.getFriends(player.uuid);

    if (!friends || !friends.friends.length) {
      if (cachedFriends) return cachedFriends;
      throw new FriendsNotFoundException(player);
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

  public async getStatus(tag: string) {
    const player = await this.get(tag, HypixelCache.CACHE, {
      uuid: true,
      displayName: true,
      prefixName: true,
      status: true,
    });

    if (!player) throw new NotFoundException("player");

    const status = await this.hypixelService.getStatus(player.uuid);

    if (!status) throw new StatusNotFoundException(player);

    status.displayName = player.displayName;
    status.prefixName = player.prefixName;
    status.uuid = player.uuid;
    status.actions = player.status;

    return status;
  }

  public async getRecentGames(tag: string) {
    const player = await this.get(tag, HypixelCache.CACHE_ONLY, {
      uuid: true,
      displayName: true,
      prefixName: true,
    });

    if (!player) throw new PlayerNotFoundException();

    const games = await this.hypixelService.getRecentGames(player.uuid);

    if (!games || !games.length) throw new RecentGamesNotFoundException(player);

    return {
      uuid: player.uuid,
      displayName: player.displayName,
      prefixName: player.prefixName,
      games,
    };
  }

  /**
   *
   * @param tag UUID or Username of the player
   * @description Deletes a player from mongo and redis
   */
  public async delete(tag: string) {
    const player = await this.findMongoDocument(tag, {});

    if (!player) return null;

    await Promise.all([
      this.playerModel.deleteOne({ uuid: player.uuid }).exec(),
      this.playerSearchService.delete(player.username),
      this.playerLeaderboardService.addLeaderboards(Player, player, "uuid", true),
    ]);
  }

  public async saveOne(player: Player, registerAutocomplete: boolean) {
    //Serialize and flatten the player
    const flatPlayer = flatten(player);
    const serializedPlayer = serialize(Player, flatPlayer);

    const day = this.dailyModel.findOne({ uuid: player.uuid }).lean().exec();
    const week = this.weeklyModel.findOne({ uuid: player.uuid }).lean().exec();
    const month = this.monthlyModel.findOne({ uuid: player.uuid }).lean().exec();

    const [dailyPlayer, weeklyPlayer, monthlyPlayer] = await Promise.all([
      day,
      week,
      month,
    ]);

    const promises = [];

    promises.push(
      this.playerModel.replaceOne({ uuid: player.uuid }, serializedPlayer, {
        upsert: true,
      })
    );

    promises.push(
      this.playerLeaderboardService.addLeaderboards(
        Player,
        flatPlayer,
        "uuid",
        player.leaderboardBanned ?? false
      )
    );

    if (dailyPlayer) {
      promises.push(
        this.playerLeaderboardService.addHistoricalLeaderboards(
          HistoricalType.DAILY,
          Player,
          flatten(merge(dailyPlayer as Player, player)),
          "uuid",
          player.leaderboardBanned ?? false
        )
      );
    }

    if (weeklyPlayer) {
      promises.push(
        this.playerLeaderboardService.addHistoricalLeaderboards(
          HistoricalType.WEEKLY,
          Player,
          flatten(merge(weeklyPlayer as Player, player)),
          "uuid",
          player.leaderboardBanned ?? false
        )
      );
    }

    if (monthlyPlayer) {
      promises.push(
        this.playerLeaderboardService.addHistoricalLeaderboards(
          HistoricalType.MONTHLY,
          Player,
          flatten(merge(monthlyPlayer as Player, player)),
          "uuid",
          player.leaderboardBanned ?? false
        )
      );
    }

    if (registerAutocomplete)
      promises.push(this.playerSearchService.add(flatPlayer as RedisPlayer));

    return Promise.all(promises);
  }

  private async findMongoDocument(
    tag: string,
    selector: Record<string, boolean> = {}
  ): Promise<Flatten<Player> | null> {
    const type = tag.length > 16 ? "uuid" : "usernameToLower";

    const mongoPlayer: Player | null = await this.playerModel
      .findOne()
      .where(type)
      .equals(tag.replaceAll("-", "").toLowerCase())
      .select(selector)
      .lean()
      .exec();

    if (!mongoPlayer) return null;

    mongoPlayer.cached = true;

    return flatten(mongoPlayer);
  }
}
