/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  REDIS_MODULE_CONNECTION,
  REDIS_MODULE_CONNECTION_TOKEN,
  REDIS_MODULE_OPTIONS_TOKEN,
} from "./redis.constants.js";
import { Redis } from "ioredis";
import { startSentrySpan } from "@statsify/logger";
import type { RedisModuleOptions } from "./redis.interfaces.js";

const REDIS_READ_COMMANDS = new Set([
  "exists",
  "get",
  "hget",
  "hgetall",
  "hmget",
  "mget",
  "ttl",
  "zrank",
  "zrange",
  "zrevrank",
  "zrevrange",
  "zscore",
  "ft.sugget",
]);

const REDIS_WRITE_COMMANDS = new Set([
  "del",
  "expire",
  "expireat",
  "hset",
  "hmset",
  "set",
  "zadd",
  "zrem",
  "ft.sugadd",
  "ft.sugdel",
]);

export function getRedisOptionsToken(connection?: string): string {
  return `${connection || REDIS_MODULE_CONNECTION}_${REDIS_MODULE_OPTIONS_TOKEN}`;
}

export function getRedisConnectionToken(connection?: string): string {
  return `${connection || REDIS_MODULE_CONNECTION}_${REDIS_MODULE_CONNECTION_TOKEN}`;
}

export function createRedisConnection(options: RedisModuleOptions) {
  const { config } = options;
  const redis = config.url ? new Redis(config.url, config) : new Redis(config);
  const sendCommand = redis.sendCommand.bind(redis);

  redis.sendCommand = ((command, stream) => {
    const commandName = String((command as { name: string }).name).toLowerCase();
    const span = startSentrySpan({
      op: getRedisSpanOperation(commandName),
      description: commandName,
      data: { "redis.command": commandName },
    });

    try {
      return (sendCommand(command, stream) as Promise<unknown>).finally(() =>
        span?.finish()
      );
    } catch (error) {
      span?.finish();
      throw error;
    }
  }) as Redis["sendCommand"];

  return redis;
}

function getRedisSpanOperation(commandName: string) {
  if (REDIS_READ_COMMANDS.has(commandName)) return "redis.get";
  if (REDIS_WRITE_COMMANDS.has(commandName)) return "redis.write";
  return "redis.command";
}
