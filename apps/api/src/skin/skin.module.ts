/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Module } from "@nestjs/common";
import { MojangModule } from "#mojang";
import { PlayerModule } from "#player";
import { Skin } from "@statsify/schemas";
import { SkinController } from "./skin.controller.js";
import { SkinService } from "./skin.service.js";
import { TypegooseModule } from "@m8a/nestjs-typegoose";

@Module({
  imports: [
    PlayerModule,
    TypegooseModule.forFeature([Skin]),
    MojangModule,
  ],
  controllers: [SkinController],
  providers: [SkinService],
})
export class SkinModule {}
