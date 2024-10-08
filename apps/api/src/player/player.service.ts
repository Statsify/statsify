/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, type Circular, type Flatten, flatten } from "@statsify/util";
import {
  CacheLevel,
  StatusNotFoundException,
} from "@statsify/api-client";
import { HypixelService } from "#hypixel";
import { Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { InjectModel } from "@m8a/nestjs-typegoose";
import {
  Player,
  deserialize,
  serialize,
} from "@statsify/schemas";
import { PlayerLeaderboardService } from "./leaderboards/player-leaderboard.service.js";
import { PlayerSearchService, RedisPlayer } from "./search/player-search.service.js";
import type { ReturnModelType } from "@typegoose/typegoose";

type PlayerModel = ReturnModelType<typeof Player>;

@Injectable()
export class PlayerService {
  public constructor(
    private readonly hypixelService: HypixelService,
    @Inject(forwardRef(() => PlayerLeaderboardService))
    private readonly playerLeaderboardService: Circular<PlayerLeaderboardService>,
    private readonly playerSearchService: PlayerSearchService,
    @InjectModel(Player) private readonly playerModel: PlayerModel
  ) {}

  /**
   *
   * @param tag UUID or username
   * @param cacheLevel What type of data to return (cached/live)
   * @param selector (optional) A mongo selector to select specific fields
   */
  public async get(
    tag: string,
    cacheLevel: CacheLevel,
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
      player.sessionReset = mongoPlayer?.sessionReset;
      player.guildId = mongoPlayer?.guildId;

      if (mongoPlayer && mongoPlayer.username !== player.username)
        await this.playerSearchService.delete(mongoPlayer.username);

      const flatPlayer = await this.saveOne(player, true);

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
    });

    if (mongoPlayer && mongoPlayer.username !== player.username)
      await this.playerSearchService.delete(mongoPlayer.username);

    player.guildId = mongoPlayer?.guildId;
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

  public async getStatus(tag: string) {
    const player = await this.get(tag, CacheLevel.CACHE, {
      uuid: true,
      displayName: true,
      prefixName: true,
      status: true,
    });

    if (!player) throw new NotFoundException("player");

    const [status, games] = await Promise.all([
      this.hypixelService.getStatus(player.uuid),
      this.hypixelService.getRecentGames(player.uuid),
    ]);

    if (!status) throw new StatusNotFoundException(player);

    status.displayName = player.displayName;
    status.prefixName = player.prefixName;
    status.uuid = player.uuid;
    status.actions = player.status;
    status.recentGames = games;

    return status;
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
    // Serialize and flatten the player
    const flatPlayer = flatten(player);
    const serializedPlayer = serialize<Player>(Player, flatPlayer);

    const promises = [
      this.playerModel
        .replaceOne({ uuid: player.uuid }, serializedPlayer, { upsert: true })
        .exec(),
      this.playerLeaderboardService.addLeaderboards(Player, flatPlayer, "uuid", false),
    ];

    if (registerAutocomplete)
      promises.push(this.playerSearchService.add(flatPlayer as RedisPlayer));

    await Promise.all(promises);
    return flatPlayer;
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
