/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DynamicModule, Module } from "@nestjs/common";
import { RedisCoreModule } from "./redis.core-module.js";
import type { RedisModuleOptions } from "./redis.interfaces.js";

@Module({})
export class RedisModule {
	public static forRoot(options: RedisModuleOptions, connection?: string): DynamicModule {
		return {
			module: RedisModule,
			imports: [RedisCoreModule.forRoot(options, connection)],
			exports: [RedisCoreModule],
		};
	}
}
