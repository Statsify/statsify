/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HypixelService } from './hypixel.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: `https://api.hypixel.net/`,
      headers: {
        'API-Key': process.env.HYPIXEL_API_KEY,
      },
      timeout: Number(process.env.HYPIXEL_API_TIMEOUT) ?? 5000,
    }),
  ],
  providers: [HypixelService],
  exports: [HypixelService],
})
export class HypixelModule {}
