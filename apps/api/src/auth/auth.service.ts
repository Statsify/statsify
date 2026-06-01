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
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";

export class RateLimitException extends HttpException {
  public readonly resetTime: number;
  public constructor(resetTime: number) {
    super("Too Many Requests", 429);
    this.resetTime = resetTime;
  }
}
import { InjectRedis } from "#redis";
import { Key } from "@statsify/schemas";
import { Redis } from "ioredis";
import { createHash, randomUUID } from "node:crypto";

const RATE_LIMIT_WINDOW_SECONDS = 60;

const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local rateLimitKey = KEYS[2]

local requiredRole = tonumber(ARGV[1])
local weight = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local windowSeconds = tonumber(ARGV[4])
local currentSecond = math.floor(now / 1000)
local windowStart = currentSecond - windowSeconds + 1

local keyData = redis.call("HMGET", key, "name", "role", "limit")
local name = keyData[1]

if not name then
  return { "unauthorized" }
end

local apiKeyRole = tonumber(keyData[2]) or 0
local apiKeyLimit = tonumber(keyData[3]) or 0

if apiKeyRole < requiredRole then
  return { "forbidden" }
end

local buckets = redis.call("HGETALL", rateLimitKey)
local weightedTotal = 0
local oldestSecond = currentSecond

for i = 1, #buckets, 2 do
  local bucketSecond = tonumber(buckets[i])
  local bucketWeight = tonumber(buckets[i + 1])

  if bucketSecond < windowStart then
    redis.call("HDEL", rateLimitKey, buckets[i])
  else
    weightedTotal = weightedTotal + bucketWeight

    if bucketSecond < oldestSecond then
      oldestSecond = bucketSecond
    end
  end
end

local projectedTotal = weightedTotal + weight
local resetTime = ((oldestSecond + windowSeconds) * 1000) - now

if projectedTotal > apiKeyLimit then
  return { "ok", name, apiKeyLimit, projectedTotal, resetTime }
end

redis.call("HINCRBY", rateLimitKey, currentSecond, weight)
redis.call("HINCRBY", key, "requests", weight)
redis.call("EXPIRE", rateLimitKey, windowSeconds)

return { "ok", name, apiKeyLimit, projectedTotal, resetTime }
`;

type RateLimitResult =
  ["unauthorized"] |
  ["forbidden"] |
  ["ok", string, number, number, number];

@Injectable()
export class AuthService {
  private readonly logger = new Logger("AuthGuard");

  public constructor(@InjectRedis() private readonly redis: Redis) {}

  public async limited(apiKey: string, weight: number, role: AuthRole) {
    const hash = this.hash(apiKey);
    const result = await this.redis.eval(
      RATE_LIMIT_SCRIPT,
      2,
      `key:${hash}`,
      `ratelimit:v2:${hash}`,
      role,
      weight,
      Date.now(),
      RATE_LIMIT_WINDOW_SECONDS
    ) as RateLimitResult;

    const [status, name, apiKeyLimit, weightedTotal, resetTime] = result;

    if (status === "unauthorized") throw new UnauthorizedException();
    if (status === "forbidden") throw new ForbiddenException();

    if (Number(weightedTotal) > Number(apiKeyLimit)) {
      this.logger.warn(
        `${name} has exceeded their request limit of ${apiKeyLimit} and has requested ${weightedTotal} times`
      );

      throw new RateLimitException(Number(resetTime));
    }

    return {
      canActivate: true,
      used: Number(weightedTotal),
      limit: Number(apiKeyLimit),
      resetTime: Number(resetTime),
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
    const key = `ratelimit:v2:${hash}`;

    const pipeline = this.redis.pipeline();
    pipeline.hmget(`key:${hash}`, "name", "requests", "limit");
    pipeline.hgetall(key);

    const pipelineResult = await pipeline.exec();

    if (!pipelineResult) throw new InternalServerErrorException();

    const [keydata, requests] = pipelineResult;

    const [name, lifetimeRequests, limit] = keydata[1] as [string, number, number];
    const requestBuckets = requests[1] as Record<string, string>;
    const { recentRequests, resetTime } = getRateLimitBucketStats(
      requestBuckets,
      Date.now()
    );

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

export function getRateLimitBucketStats(buckets: Record<string, string>, now: number) {
  const currentSecond = Math.floor(now / 1000);
  const windowStart = currentSecond - RATE_LIMIT_WINDOW_SECONDS + 1;

  let oldestSecond = currentSecond;
  let recentRequests = 0;

  for (const [bucket, weight] of Object.entries(buckets)) {
    const bucketSecond = Number(bucket);

    if (bucketSecond < windowStart) continue;

    recentRequests += Number(weight);

    if (bucketSecond < oldestSecond) {
      oldestSecond = bucketSecond;
    }
  }

  return {
    recentRequests,
    resetTime: recentRequests > 0 ?
      (oldestSecond + RATE_LIMIT_WINDOW_SECONDS) * 1000 - now :
      0,
  };
}
