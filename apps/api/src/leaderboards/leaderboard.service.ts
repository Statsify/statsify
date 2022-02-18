import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { getLeaderboardFields } from '@statsify/schemas';
import { Constructor, flatten } from '@statsify/util';

@Injectable()
export class LeaderboardService {
  public constructor(@InjectRedis() private readonly redis: Redis) {}

  public addLeaderboards<T>(
    constructor: Constructor<T>,
    instance: T,
    idField: keyof T,
    fields: string[] = this.getLeaderboardFields(constructor),
    remove = false
  ) {
    const pipeline = this.redis.pipeline();
    const name = constructor.name.toLowerCase();
    const flatInstance = flatten(instance);

    const id = instance[idField] as unknown as string;

    fields
      .filter((field) => remove || (flatInstance[field] && typeof flatInstance[field] === 'number'))
      .forEach((field) => {
        const value = flatInstance[field];

        if (remove || value === 0 || Number.isNaN(value)) {
          pipeline.zrem(`${name}.${field}`, id);
        } else {
          pipeline.zadd(`${name}.${field}`, value, id);
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

  public async getLeaderboardDocument<T>(
    constructor: Constructor<T>,
    id: string,
    selector?: string[]
  ) {
    const pipeline = this.redis.pipeline();
    const name = constructor.name.toLowerCase();

    if (!selector) {
      selector = this.getLeaderboardFields(constructor);
    }

    selector.forEach((field) => {
      pipeline.zscore(`${name}.${field}`, id);
    });

    const scores = await pipeline.exec();

    const response: Record<string, number> = {};

    for (let i = 0; i < selector.length; i++) {
      const field = selector[i];
      const score = scores[i][1];

      if (score !== null) {
        response[field] = Number(score);
      } else {
        response[field] = 0;
      }
    }

    return response;
  }

  public getLeaderboardFields<T>(constructor: Constructor<T>) {
    return getLeaderboardFields(
      new constructor(...Array.from({ length: constructor.length }).fill({}))
    );
  }
}
