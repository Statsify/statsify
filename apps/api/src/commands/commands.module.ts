/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Commands } from "@statsify/schemas";
import { CommandsController } from "./commands.controller.js";
import { CommandsService } from "./commands.service.js";
import { Module } from "@nestjs/common";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
	imports: [TypegooseModule.forFeature([Commands])],
	controllers: [CommandsController],
	providers: [CommandsService],
})
export class CommandsModule {}
