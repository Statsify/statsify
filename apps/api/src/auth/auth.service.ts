/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Key } from '@statsify/schemas';
import { createHash } from 'crypto';
import { uuid } from 'short-uuid';
import { AuthRole } from './auth.role';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthGuard');

  public constructor(@InjectRedis() private readonly redis: Redis) {}

  public async limited(apiKey: string, weight: number, role: AuthRole) {
    const hash = this.hash(apiKey);

    const [name, ...keyInfo] = await this.redis.hmget(`key:${hash}`, 'name', 'role', 'limit');

    if (name === null) throw new UnauthorizedException();

    const [apiKeyRole, apiKeyLimit] = keyInfo.map(Number);

    if (apiKeyRole < role) throw new ForbiddenException();

    const pipeline = this.redis.pipeline();

    const time = Date.now();
    const expirey = 60000;

    const key = `ratelimit:${hash}`;

    pipeline.zremrangebyscore(key, 0, time - expirey);
    pipeline.zadd(key, time, `${uuid()}:${weight}`);
    pipeline.zrange(key, 0, -1, 'WITHSCORES');
    pipeline.hincrby(`key:${hash}`, 'requests', weight);
    pipeline.expire(key, expirey / 1000);

    const pipelineResult = await pipeline.exec();

    if (!pipelineResult) throw new InternalServerErrorException();

    const [, , requests] = pipelineResult;

    if (requests[0]) throw new InternalServerErrorException();

    const weightedTotal = (requests[1] as string[])
      .filter((_, i) => i % 2 === 0)
      .reduce((acc, key) => acc + Number(key.split(':')[1]), 0);

    const resetTime = 60000 - (time - (requests[1] as [Error | null, number])[1]);

    if (weightedTotal > apiKeyLimit) {
      this.logger.warn(
        `${name} has exceeded their request limit of ${apiKeyLimit} and has requested ${weightedTotal} times`
      );

      throw new HttpException('Too Many Requests', 429);
    }

    return {
      canActivate: true,
      used: weightedTotal,
      limit: apiKeyLimit,
      resetTime,
    };
  }

  public async createKey(name: string): Promise<string> {
    const apiKey = uuid().replace(/-/g, '');
    const hash = this.hash(apiKey);

    await this.redis.hmset(
      `key:${hash}`,
      'name',
      name,
      'role',
      AuthRole.MEMBER,
      'limit',
      30,
      'requests',
      0
    );

    return apiKey;
  }

  public async getKey(apiKey: string): Promise<Key> {
    const hash = this.hash(apiKey);
    const key = `ratelimit:${hash}`;

    const pipeline = this.redis.pipeline();
    pipeline.hmget(`key:${hash}`, 'name', 'requests', 'limit');
    pipeline.zrange(key, 0, -1, 'WITHSCORES');

    const pipelineResult = await pipeline.exec();

    if (!pipelineResult) throw new InternalServerErrorException();

    const [keydata, requests] = pipelineResult;

    const [name, lifetimeRequests, limit] = keydata[1] as [string, number, number];

    const recentRequests = (requests[1] as string[])
      .filter((_, i) => i % 2 === 0)
      .reduce((acc, key) => acc + Number(key.split(':')[1]), 0);

    const time = Date.now();

    const resetTime = 60000 - (time - Number((requests[1] as [Error | null, number])[1]));

    return {
      name,
      lifetimeRequests: Number(lifetimeRequests),
      recentRequests,
      resetTime,
      limit: Number(limit),
    };
  }

  private hash(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }
}
