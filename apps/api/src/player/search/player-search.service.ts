/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { Injectable } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { Player } from "@statsify/schemas";
import { Redis } from "ioredis";
import type { ReturnModelType } from "@typegoose/typegoose";

const REDI_SEARCH_NOT_INSTALLED =
  "This error was most likely caused because RediSearch is not installed.";
const PLAYER_AUTOCOMPLETE_KEY = "player:autocomplete";

export interface RedisPlayer {
  username: string;
  uuid: string;
}

@Injectable()
export class PlayerSearchService {
  private logger = new Logger("PlayerSearchService");

  public constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>
  ) {}

  public async get(query: string): Promise<string[]> {
    query = query.trim().toLowerCase();

    if (!query) return this.getCachedPlayers();

    const searchOptions = query.length >= 3 ? ["FUZZY", "MAX", "25"] : ["MAX", "25"];

    const redisResults = await (
      this.redis.call(
        "FT.SUGGET",
        PLAYER_AUTOCOMPLETE_KEY,
        query,
        ...searchOptions
      ) as Promise<string[]>
    ).catch((e) => {
      this.handleRedisError(e);

      return [];
    });

    if (redisResults.length > 0) return redisResults;

    return this.getCachedPlayers(query);
  }

  public async add(player: RedisPlayer) {
    if (player.username.length < 3 || player.username.length > 16) return;

    await this.redis
      .call("FT.SUGADD", PLAYER_AUTOCOMPLETE_KEY, player.username, "1", "INCR")
      .catch((e) => this.handleRedisError(e));
  }

  public delete(name: string) {
    return this.redis
      .call("FT.SUGDEL", PLAYER_AUTOCOMPLETE_KEY, name)
      .catch((e) => this.handleRedisError(e));
  }

  private async getCachedPlayers(query?: string) {
    const filter = query ?
      { usernameToLower: { $regex: `^${this.escapeRegex(query)}` } } :
      {};

    const players = await this.playerModel
      .find(filter)
      .select({ username: true, _id: false })
      .sort({ "stats.general.networkExp": -1 })
      .limit(25)
      .lean()
      .exec();

    return players.map(({ username }) => username);
  }

  private escapeRegex(input: string) {
    return input.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  }

  private handleRedisError(error: unknown) {
    this.logger.error(error);
    this.logger.error(REDI_SEARCH_NOT_INSTALLED);
  }
}
