/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Guild } from "@statsify/schemas";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { Injectable } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { Redis } from "ioredis";
import type { ReturnModelType } from "@typegoose/typegoose";

const REDI_SEARCH_NOT_INSTALLED =
  "This error was most likely caused because RediSearch is not installed.";
const GUILD_AUTOCOMPLETE_KEY = "guild:autocomplete";

@Injectable()
export class GuildSearchService {
  private logger = new Logger("GuildSearchService");

  public constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectModel(Guild) private readonly guildModel: ReturnModelType<typeof Guild>
  ) {}

  public async get(query: string): Promise<string[]> {
    query = query.trim().toLowerCase();

    if (!query) return this.getCachedGuilds();

    const searchOptions = query.length >= 3 ? ["FUZZY", "MAX", "25"] : ["MAX", "25"];

    const redisResults = await (
      this.redis.call(
        "FT.SUGGET",
        GUILD_AUTOCOMPLETE_KEY,
        query,
        ...searchOptions
      ) as Promise<string[]>
    ).catch((e) => {
      this.handleRedisError(e);

      return [];
    });

    if (redisResults.length) return redisResults;

    return this.getCachedGuilds(query);
  }

  public async add(name: string) {
    if (name.length < 3 || name.length > 32) return;

    await this.redis
      .call("FT.SUGADD", GUILD_AUTOCOMPLETE_KEY, name, "1", "INCR")
      .catch((e) => this.handleRedisError(e));
  }

  private async getCachedGuilds(query?: string) {
    const filter = query ?
      { nameToLower: { $regex: `^${this.escapeRegex(query)}` } } :
      {};

    const guilds = await this.guildModel
      .find(filter)
      .select({ name: true, _id: false })
      .sort({ exp: -1 })
      .limit(25)
      .lean()
      .exec();

    return guilds.map(({ name }) => name);
  }

  private escapeRegex(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  }

  private handleRedisError(error: unknown) {
    this.logger.error(error);
    this.logger.error(REDI_SEARCH_NOT_INSTALLED);
  }
}
