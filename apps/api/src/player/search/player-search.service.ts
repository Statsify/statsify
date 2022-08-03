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

/**
 * Things to consider:
 * 3. We want to hoist premium users to the top of the list
 */

export interface RedisPlayer {
  username: string;
  uuid: string;
}

@Injectable()
export class PlayerSearchService {
  private logger;
  public constructor(@InjectRedis() private readonly redis: Redis) {
    this.logger = new Logger("PlayerSearch");
  }

  public get(query: string) {
    return this.redis.call(
      "FT.SUGGET",
      "player:autocomplete",
      query,
      "FUZZY",
      "MAX",
      "25"
    );
  }

  public async add(player: RedisPlayer) {
    if (player.username.length < 3 || player.username.length > 16) return;

    return this.redis
      .call("FT.SUGADD", "player:autocomplete", player.username, "1", "INCR")
      .catch((reason) => this.logger.error(reason));
  }

  public delete(name: string) {
    return this.redis.call("FT.SUGDEL", "player:autocomplete", name);
  }
}
