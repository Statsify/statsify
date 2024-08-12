/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { Hypixel } from "#services/hypixel";
import { Logger } from "@statsify/logger";
import { Redis } from "ioredis";
import { config } from "@statsify/util";
import { initTRPC } from "@trpc/server";

export const t = initTRPC.context<typeof createContext>().create();

export async function createContext(_: CreateHTTPContextOptions) {
  const logger = new Logger();
  const hypixel = new Hypixel(config("hypixelApi.key"));
  const redis = new Redis();

  return { logger, hypixel, redis };
}

