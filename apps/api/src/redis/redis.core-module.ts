/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DynamicModule, Global, Module, Provider } from "@nestjs/common";
import { RedisModuleOptions } from "./redis.interfaces.js";
import {
  createRedisConnection,
  getRedisConnectionToken,
  getRedisOptionsToken,
} from "./redis.utils.js";

@Global()
@Module({})
export class RedisCoreModule {
  public static forRoot(options: RedisModuleOptions, connection?: string): DynamicModule {
    const redisOptionsProvider: Provider = {
      provide: getRedisOptionsToken(connection),
      useValue: options,
    };

    const redisConnectionProvider: Provider = {
      provide: getRedisConnectionToken(connection),
      useValue: createRedisConnection(options),
    };

    return {
      module: RedisCoreModule,
      providers: [redisOptionsProvider, redisConnectionProvider],
      exports: [redisOptionsProvider, redisConnectionProvider],
    };
  }
}
