/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import assert from "node:assert";
import { ApiException } from "./exception.js";
import { config } from "@statsify/util";
import { createHash, randomUUID } from "node:crypto";
import { createMiddleware } from "hono/factory";
import { redis } from "./db/redis.js";

const MissingApiKeyException = new ApiException(400, ["Missing 'X-API-Key' header or 'key' query"]);
const UnauthorizedApiKeyException = new ApiException(401, ["Unauthorized API Key"]);
const ForbiddenResourceException = new ApiException(403, ["Insufficient Permissions"]);
const ApiKeyRatelimitedException = new ApiException(429, ["API ratelimit exceeded"]);
const InternalServerErrorException = new ApiException(500, ["Internal Server Error"]);

const ignoreAuth = config("api.ignoreAuth", { required: false });

export const Permissions = {
  UserRead: 1,
  // Verify, Unverify, and Update users
  UserManage: 1 << 1,
  SkinRead: 1 << 2,
  SessionRead: 1 << 3,
  // Reset and Delete Sessions
  SessionManage: 1 << 4,
  PlayerRead: 1 << 5,
  // Delete Players, Update Players Externally
  PlayerManage: 1 << 6,
  GuildRead: 1 << 7,
  AnalyticsManage: 1 << 8,
  LeaderboardRead: 1 << 9,
  AutocompleteRead: 1 << 10,
} as const;

export type Predicate = (permissions: number) => boolean;

export const Policy = {
  all: (...predicates: (Predicate | undefined)[]): Predicate => {
    const definedPredicates = predicates.filter((predicate) => predicate !== undefined);
    return (permissions) => definedPredicates.every((predicate) => predicate(permissions));
  },
  some: (...predicates: (Predicate | undefined)[]): Predicate => {
    const definedPredicates = predicates.filter((predicate) => predicate !== undefined);
    return (permissions) => definedPredicates.some((predicate) => predicate(permissions));
  },
  has: (permission: number): Predicate => (permissions) => (permissions & permission) === permission,
};

export type AuthOptions = {
  policy: Predicate;
  weight?: number;
};

export function auth({ policy, weight = 1 }: AuthOptions) {
  assert(weight >= 1, "Auth weight should be greater than 0");

  return createMiddleware(async (c, next) => {
    if (ignoreAuth) {
      await next();
      return;
    }

    const apiKey = c.req.header("X-API-Key") ?? c.req.query("key");
    if (!apiKey) throw MissingApiKeyException;

    const hashedKey = hash(apiKey);

    const [name, ...keyInfo] = await redis.hmget(
      `key:${hashedKey}`,
      "name",
      "permissions",
      "limit"
    );

    if (name === null) throw UnauthorizedApiKeyException;

    const [permissions, limit] = keyInfo.map(Number);

    if (!policy(permissions)) throw ForbiddenResourceException;

    const pipeline = redis.pipeline();

    const time = Date.now();
    const expiry = 60_000;

    const ratelimitKey = `ratelimit:${hash}`;
    // Remove any old expired entries from the sorted set
    pipeline.zremrangebyscore(ratelimitKey, 0, time - expiry);
    // Add the current request
    pipeline.zadd(ratelimitKey, time, `${randomUUID()}:${weight}`);
    // Find all (non-expired) requests
    pipeline.zrange(ratelimitKey, 0, -1, "WITHSCORES");
    // Increment global api key requests counter
    pipeline.hincrby(`key:${hash}`, "requests", weight);
    // Remove the ratelimit key in expiry seconds
    pipeline.expire(ratelimitKey, expiry / 1000);

    const result = await pipeline.exec();

    // There was an error with the zrange command
    if (!result || result?.[2]?.[0]) throw InternalServerErrorException;

    const weightedTotal = (result[2][1] as string[])
      .filter((_, i) => i % 2 === 0)
      .reduce((acc, key) => acc + Number(key.split(":")[1]), 0);

    const resetTime = 60_000 - (time - (result[2][1] as [Error | null, number])[1]);

    c.header("X-Ratelimit-Used", `${weightedTotal}`);
    c.header("X-Ratelimit-Total", `${limit}`);
    c.header("X-Ratelimit-Timeout", `${resetTime}`);

    if (weightedTotal > limit) {
      console.warn(`${name} has exceeded their request limit of ${limit} and has requested ${weightedTotal} times`);
      throw ApiKeyRatelimitedException;
    }

    await next();
  });
}

const hash = (apiKey: string) => createHash("sha256")
  .update(apiKey)
  .digest("hex");
