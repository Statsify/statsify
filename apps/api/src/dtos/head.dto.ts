/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Transform } from "class-transformer";
import { UuidDto } from "./uuid.dto.js";

export class HeadDto extends UuidDto {
	@IsOptional()
	@Transform(({ value }) => +value)
	@IsInt()
	@Min(8)
	@Max(800)
	@ApiProperty({
		description: "The size of the head",
		default: 160,
		minimum: 8,
		maximum: 800,
	})
	public size = 160;
}
