/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { Skin } from "@statsify/schemas";
import { SkinController } from "./skin.controller.js";
import { SkinService } from "./skin.service.js";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [
    TypegooseModule.forFeature([Skin]),
    // Mojang lookups give up in time for the default skin to be rendered before the bot's
    // 5 second image timeout
    HttpModule.register({ timeout: 3000 }),
  ],
  controllers: [SkinController],
  providers: [SkinService],
})
export class SkinModule {}
