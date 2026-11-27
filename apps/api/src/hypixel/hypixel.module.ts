/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Agent } from "node:https";
import { HttpModule } from "@nestjs/axios";
import { HypixelService } from "./hypixel.service.js";
import { Module } from "@nestjs/common";
import { config } from "@statsify/util";

export const KEEP_ALIVE_AGENT_OPTIONS = { keepAlive: true, timeout: 30_000 };

@Module({
  imports: [
    HttpModule.register({
      baseURL: "https://api.hypixel.net/",
      headers: {
        "API-Key": await config("hypixelApi.key"),
        "accept-encoding": "*",
      },
      httpsAgent: new Agent(KEEP_ALIVE_AGENT_OPTIONS),
      timeout: await config("hypixelApi.timeout", { default: 5000 }),
    }),
  ],
  providers: [HypixelService],
  exports: [HypixelService],
})
export class HypixelModule {}
