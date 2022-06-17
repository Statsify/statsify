import { InjectModel } from '@m8a/nestjs-typegoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Player } from '@statsify/schemas';
import { flatten } from '@statsify/util';
import { ReturnModelType } from '@typegoose/typegoose';
import Redis from 'ioredis';
import { LeaderboardAdditionalStats, LeaderboardService } from '../../leaderboards';

@Injectable()
export class PlayerLeaderboardService extends LeaderboardService {
  public constructor(
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>,
    @InjectRedis() redis: Redis
  ) {
    super(redis);
  }

  protected searchLeaderboardInput(input: string): Promise<number> {
    throw new Error('Method not implemented.');
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
