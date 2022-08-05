/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Redis from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable } from "@nestjs/common";
import { Logger } from "@statsify/logger";

export interface RedisPlayer {
  username: string;
  uuid: string;
}

@Injectable()
export class PlayerSearchService {
  private logger = new Logger("PlayerSearchService");

  public constructor(@InjectRedis() private readonly redis: Redis) {}

  public get(query: string): Promise<string[]> {
    try {
      return this.redis.call(
        "FT.SUGGET",
        "player:autocomplete",
        query,
        "FUZZY",
        "MAX",
        "25"
      ) as Promise<string[]>;
    } catch (e) {
      this.logger.error(e);
      this.logger.error(
        `This error was most likely caused because RediSearch is not installed.`
      );

      return Promise.resolve([]);
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
      this.logger.error(
        `This error was most likely caused because RediSearch is not installed.`
      );
    }
  }

  public delete(name: string) {
    try {
      return this.redis.call("FT.SUGDEL", "player:autocomplete", name);
    } catch (e) {
      this.logger.error(e);
      this.logger.error(
        `This error was most likely caused because RediSearch is not installed.`
      );
    }
  }
}
