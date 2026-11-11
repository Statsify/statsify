/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AuthRole } from "./auth.role.js";
import {
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRedis, pipelineValues } from "#redis";
import { Key } from "@statsify/schemas";
import { Redis } from "ioredis";
import { createHash, randomUUID } from "node:crypto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger("AuthGuard");

  public constructor(@InjectRedis() private readonly redis: Redis) {}

  public async limited(apiKey: string, weight: number, role: AuthRole) {
    const hash = this.hash(apiKey);

    const [name, ...keyInfo] = await this.redis.hmget(
      `key:${hash}`,
      "name",
      "role",
      "limit"
    );

    if (name === null) throw new UnauthorizedException();

    const [apiKeyRole, apiKeyLimit] = keyInfo.map(Number);

    if (apiKeyRole < role) throw new ForbiddenException();

    const pipeline = this.redis.pipeline();

    const time = Date.now();
    const expirey = 60_000;

    const key = `ratelimit:${hash}`;

    pipeline.zremrangebyscore(key, 0, time - expirey);
    pipeline.zadd(key, time, `${randomUUID()}:${weight}`);
    pipeline.zrange(key, 0, -1, "WITHSCORES");
    pipeline.hincrby(`key:${hash}`, "requests", weight);
    pipeline.expire(key, expirey / 1000);

    const requests = pipelineValues(await pipeline.exec())[2] as string[];

    const weightedTotal = requests
      .filter((_, i) => i % 2 === 0)
      .reduce((acc, key) => acc + Number(key.split(":")[1]), 0);

    const resetTime = 60_000 - (time - Number(requests[1]));

    if (weightedTotal > apiKeyLimit) {
      this.logger.warn(
        `${name} has exceeded their request limit of ${apiKeyLimit} and has requested ${weightedTotal} times`
      );

      throw new HttpException("Too Many Requests", 429);
    }

    return {
      canActivate: true,
      used: weightedTotal,
      limit: apiKeyLimit,
      resetTime,
    };
  }

  public async createKey(name: string): Promise<string> {
    const apiKey = randomUUID().replaceAll("-", "");
    const hash = this.hash(apiKey);

    await this.redis.hmset(
      `key:${hash}`,
      "name",
      name,
      "role",
      AuthRole.MEMBER,
      "limit",
      30,
      "requests",
      0
    );

    return apiKey;
  }

  public async getKey(apiKey: string): Promise<Key> {
    const hash = this.hash(apiKey);
    const key = `ratelimit:${hash}`;

    const pipeline = this.redis.pipeline();
    pipeline.hmget(`key:${hash}`, "name", "requests", "limit");
    pipeline.zrange(key, 0, -1, "WITHSCORES");

    const [keydata, requests] = pipelineValues(await pipeline.exec()) as [
      [string, number, number],
      string[],
    ];

    const [name, lifetimeRequests, limit] = keydata;

    const recentRequests = requests
      .filter((_, i) => i % 2 === 0)
      .reduce((acc, key) => acc + Number(key.split(":")[1]), 0);

    const time = Date.now();

    const resetTime = 60_000 - (time - Number(requests[1]));

    return {
      name,
      lifetimeRequests: Number(lifetimeRequests),
      recentRequests,
      resetTime,
      limit: Number(limit),
    };
  }

  private hash(apiKey: string): string {
    return createHash("sha256").update(apiKey).digest("hex");
  }
}
