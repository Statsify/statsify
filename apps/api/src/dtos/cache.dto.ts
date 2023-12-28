/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { HypixelCache } from "@statsify/api-client";
import { IsEnum, IsOptional } from "class-validator";

export class CacheDto {
	@ApiProperty({
		enum: HypixelCache,
		enumName: "HypixelCache",
		example: HypixelCache.CACHE,
		default: HypixelCache.CACHE,
		description: "Describes whether to return live data or cached data.",
		required: false,
	})
	@IsOptional()
	@IsEnum(HypixelCache)
	public cache: HypixelCache = HypixelCache.CACHE;
}
