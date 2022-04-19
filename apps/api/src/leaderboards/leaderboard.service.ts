import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { LeaderboardScanner } from '@statsify/schemas';
import { Constructor, Flatten, FlattenKeys } from '@statsify/util';

@Injectable()
export class LeaderboardService {
  public constructor(@InjectRedis() private readonly redis: Redis) {}

  public addLeaderboards<T>(
    constructor: Constructor<T>,
    instance: Flatten<T>,
    idField: FlattenKeys<T>,
    fields: FlattenKeys<T>[] = LeaderboardScanner.getLeaderboardFields(
      constructor
    ) as FlattenKeys<T>[],
    remove = false
  ) {
    const pipeline = this.redis.pipeline();
    const name = constructor.name.toLowerCase();

    const id = instance[idField] as unknown as string;

    fields
      .filter((field) => remove || (instance[field] && typeof instance[field] === 'number'))
      .forEach((field) => {
        const value = instance[field];

        if (remove || value === 0 || Number.isNaN(value)) {
          pipeline.zrem(`${name}.${field}`, id);
        } else {
          pipeline.zadd(`${name}.${field}`, value as string, id);
        }
      });

    return pipeline.exec();
  }

  public async getLeaderboard<T>(
    constructor: Constructor<T>,
    field: string,
    top: number,
    bottom: number
  ) {
    const name = constructor.name.toLowerCase();
    field = `${name}.${field}`;

    const scores = await this.redis.zrevrange(field, top, bottom, 'WITHSCORES');

    const response: { id: string; score: number; index: number }[] = [];

    for (let i = 0; i < scores.length; i += 2) {
      const id = scores[i];
      const score = Number(scores[i + 1]);

      response.push({ id, score, index: i / 2 + top });
    }

    return response;
  }

  public async getLeaderboardRanking<T>(constructor: Constructor<T>, field: string, id: string) {
    return this.redis.zrevrank(`${constructor.name.toLowerCase()}.${field}`, id);
  }

  public async getLeaderboardDocument<T>(
    constructor: Constructor<T>,
    id: string,
    selector?: FlattenKeys<T>[]
  ) {
    const pipeline = this.redis.pipeline();
    const name = constructor.name.toLowerCase();

    if (!selector) selector = LeaderboardScanner.getLeaderboardFields(constructor);

    selector.forEach((field) => {
      pipeline.zscore(`${name}.${field}`, id);
    });

    const scores = await pipeline.exec();

    const response: Record<string, number> = {};

    for (let i = 0; i < selector.length; i++) {
      const field = selector[i];
      const score = scores[i][1];

      if (score !== null) {
        response[field as string] = Number(score);
      } else {
        response[field as string] = 0;
      }
    }

    return response;
  }
}
