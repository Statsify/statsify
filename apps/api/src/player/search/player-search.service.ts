/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { InjectRedis } from "#redis";
import { Injectable } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { Redis } from "ioredis";

const REDI_SEARCH_NOT_INSTALLED =
  "This error was most likely caused because RediSearch is not installed.";

// A fuzzy search on one or two characters walks most of the dictionary, so those results are
// cached in memory for a minute. The API runs as a single process
const SHORT_QUERY_LENGTH = 2;
const SHORT_QUERY_TTL = 60_000;

export interface RedisPlayer {
  username: string;
  uuid: string;
}

@Injectable()
export class PlayerSearchService {
  private logger = new Logger("PlayerSearchService");
  private readonly shortQueries = new Map<string, { expiresAt: number; players: Promise<string[]> }>();

  public constructor(@InjectRedis() private readonly redis: Redis) {}

  public get(query: string): Promise<string[]> {
    if (query.length > SHORT_QUERY_LENGTH) return this.search(query);

    // FT.SUGGET ignores case, so "A" and "a" share an entry. Only username characters are
    // lowercased: RediSearch folds a few others, like the Kelvin sign, differently from toLowerCase
    const key = /^\w*$/.test(query) ? query.toLowerCase() : query;

    const now = Date.now();
    const cached = this.shortQueries.get(key);
    if (cached && now < cached.expiresAt) return cached.players;

    // Entries are in insertion order with the same TTL, so the expired ones are at the front
    for (const [cachedKey, { expiresAt }] of this.shortQueries) {
      if (now < expiresAt) break;
      this.shortQueries.delete(cachedKey);
    }

    const players = this.search(query);
    this.shortQueries.set(key, { expiresAt: now + SHORT_QUERY_TTL, players });

    return players;
  }

  private async search(query: string): Promise<string[]> {
    try {
      return (await this.redis.call(
        "FT.SUGGET",
        "player:autocomplete",
        query,
        "FUZZY",
        "MAX",
        "25"
      )) as string[];
    } catch (e) {
      this.logger.error(e);
      this.logger.error(REDI_SEARCH_NOT_INSTALLED);

      return [];
    }
  }

  public async add(player: RedisPlayer) {
    if (player.username.length < 3 || player.username.length > 16) return;

    try {
      await this.redis.call(
        "FT.SUGADD",
        "player:autocomplete",
        player.username,
        "1",
        "INCR"
      );
    } catch (e) {
      this.logger.error(e);
      this.logger.error(REDI_SEARCH_NOT_INSTALLED);
    }
  }

  public delete(name: string) {
    return this.redis.call("FT.SUGDEL", "player:autocomplete", name).catch((e) => {
      this.logger.error(e);
      this.logger.error(REDI_SEARCH_NOT_INSTALLED);
    });
  }
}
