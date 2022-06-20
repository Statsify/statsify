/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { InjectModel } from '@m8a/nestjs-typegoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HypixelCache, PlayerNotFoundException } from '@statsify/api-client';
import { Player } from '@statsify/schemas';
import { flatten } from '@statsify/util';
import { ReturnModelType } from '@typegoose/typegoose';
import Redis from 'ioredis';
import { LeaderboardAdditionalStats, LeaderboardService } from '../../leaderboards';
import { PlayerService } from '../player.service';

@Injectable()
export class PlayerLeaderboardService extends LeaderboardService {
  public constructor(
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>,
    @InjectRedis() redis: Redis
  ) {
    super(redis);
  }

  protected async searchLeaderboardInput(input: string, field: string): Promise<number> {
    if (input.length <= 16) {
      const player = await this.playerService.get(input, HypixelCache.CACHE_ONLY, { uuid: true });

      if (!player) throw new PlayerNotFoundException();
      input = player.uuid;
    }

    const ranking = await this.getLeaderboardRankings(Player, [field], input);

    if (!ranking || !ranking[0].rank) throw new PlayerNotFoundException();

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

    selector.displayName = true;

    return await Promise.all(
      ids.map(async (id) => {
        const player = await this.playerModel
          .findOne()
          .where('uuid')
          .equals(id)
          .select(selector)
          .lean()
          .exec();

        const additionalStats = flatten(player) as LeaderboardAdditionalStats;
        additionalStats.name = additionalStats.displayName;

        return additionalStats;
      })
    );
  }
}
