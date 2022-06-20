/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { Skin } from '@statsify/schemas';
import { SkinController } from './skin.controller';
import { SkinService } from './skin.service';

@Module({
  imports: [
    TypegooseModule.forFeature([Skin]),
    HttpModule.register({
      baseURL: 'https://sessionserver.mojang.com/',
    }),
  ],
  controllers: [SkinController],
  providers: [SkinService],
})
export class SkinModule {}
