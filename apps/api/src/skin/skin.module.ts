/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { MongoModule } from "#mongo";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { SkinSchema } from "@statsify/schemas";
import { SkinController } from "./skin.controller.js";
import { SkinService } from "./skin.service.js";

@Module({
  imports: [
    MongoModule.forFeature([SkinSchema]),
    HttpModule.register({}),
  ],
  controllers: [SkinController],
  providers: [SkinService],
})
export class SkinModule {}
