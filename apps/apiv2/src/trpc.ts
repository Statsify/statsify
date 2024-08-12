/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Hypixel } from "#services/hypixel";
import { Logger } from "@statsify/logger";
import { Redis } from "ioredis";
import { config } from "@statsify/util";
import { initTRPC } from "@trpc/server";

export const t = initTRPC.context<Context>().create();

// Can optionally take 1 parameter of `CreateHTTPContextOptions` from "@trpc/server/adapters/standalone"
export async function createContext() {
  const logger = new Logger();
  const hypixel = new Hypixel(config("hypixelApi.key"));
  const redis = new Redis(config("database.redisUrl"));

  return { logger, hypixel, redis };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
