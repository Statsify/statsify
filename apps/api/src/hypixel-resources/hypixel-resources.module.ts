/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HypixelModule } from "#hypixel";
import { HypixelResourcesController } from "./hypixel-resources.controller.js";
import { Module } from "@nestjs/common";

@Module({
	imports: [HypixelModule],
	controllers: [HypixelResourcesController],
})
export class HypixelResourcesModule {}
