/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { InjectModel } from '@m8a/nestjs-typegoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { GuildNotFoundException, GUILD_ID_REGEX } from '@statsify/api-client';
import { Guild } from '@statsify/schemas';
import { flatten } from '@statsify/util';
import { ReturnModelType } from '@typegoose/typegoose';
import Redis from 'ioredis';
import { LeaderboardAdditionalStats, LeaderboardService } from '../../leaderboards';

@Injectable()
export class GuildLeaderboardService extends LeaderboardService {
  public constructor(
    @InjectModel(Guild) private readonly guildModel: ReturnModelType<typeof Guild>,
    @InjectRedis() redis: Redis
  ) {
    super(redis);
  }

  protected async searchLeaderboardInput(input: string, field: string): Promise<number> {
    if (!input.match(GUILD_ID_REGEX)) {
      const guild = await this.guildModel
        .findOne()
        .where('nameToLower')
        .equals(input.toLowerCase())
        .select({ id: true })
        .lean()
        .exec();

      if (!guild) throw new GuildNotFoundException();
      input = guild.id;
    }

    const ranking = await this.getLeaderboardRankings(Guild, [field], input);

    if (!ranking || !ranking[0].rank) throw new GuildNotFoundException();

    return ranking[0].rank;
  }

  protected async getAdditionalStats(
    ids: string[],
    fields: string[]
  ): Promise<LeaderboardAdditionalStats[]> {
    const selector = fields.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);

    selector.nameFormatted = true;

    return await Promise.all(
      ids.map(async (id) => {
        const guild = await this.guildModel
          .findOne()
          .where('id')
          .equals(id)
          .select(selector)
          .lean()
          .exec();

        const additionalStats = flatten(guild) as LeaderboardAdditionalStats;
        additionalStats.name = additionalStats.nameFormatted;

        return additionalStats;
      })
    );
  }
}
