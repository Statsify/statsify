/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { Player, Skin } from "@statsify/schemas";
import { SkinController } from "./skin.controller.js";
import { SkinService } from "./skin.service.js";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [
    TypegooseModule.forFeature([Skin, Player]),
    HttpModule.register({}),
  ],
  controllers: [SkinController],
  providers: [SkinService],
})
export class SkinModule {}
