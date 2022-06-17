import { InjectModel } from '@m8a/nestjs-typegoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
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
