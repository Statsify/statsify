/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import {
  REDIS_MODULE_CONNECTION,
  REDIS_MODULE_CONNECTION_TOKEN,
  REDIS_MODULE_OPTIONS_TOKEN,
} from "./redis.constants.js";
import { Redis } from "ioredis";
import type { RedisModuleOptions } from "./redis.interfaces.js";

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
    const commandName = String((command as { name: string }).name);
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
    const span = transaction?.startChild({
      op: "redis.query",
      description: commandName,
      data: { "redis.command": commandName },
    });

    return (sendCommand(command, stream) as Promise<unknown>).finally(() => span?.finish());
  }) as Redis["sendCommand"];

  return redis;
}
