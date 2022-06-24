/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HttpModule } from "@nestjs/axios";
import { HypixelService } from "./hypixel.service";
import { Module } from "@nestjs/common";
import { env } from "@statsify/util";

@Module({
  imports: [
    HttpModule.register({
      baseURL: `https://api.hypixel.net/`,
      headers: {
        "API-Key": env("HYPIXEL_API_KEY"),
      },
      timeout: env("HYPIXEL_API_TIMEOUT", { default: 5000 }),
    }),
  ],
  providers: [HypixelService],
  exports: [HypixelService],
})
export class HypixelModule {}
