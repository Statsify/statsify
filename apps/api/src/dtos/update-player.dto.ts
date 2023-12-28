/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdatePlayerDto {
	@IsString()
	@ApiProperty()
	public uuid: string;

	@IsString()
	@ApiProperty()
	public playername: string;

	@IsString()
	@ApiProperty()
	public displayname: string;
}
