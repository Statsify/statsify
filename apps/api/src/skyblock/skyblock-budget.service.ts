/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HypixelService } from "#hypixel";
import { InjectRedis } from "#redis";
import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { config } from "@statsify/util";

const WINDOW = 300_000;
const HYPIXEL_BUDGET = await config("skyblock.hypixelBudget", { default: 60 });
const RESERVE = await config("skyblock.reserve", { default: 100 });

export class BudgetError extends Error {
  public constructor(public readonly retryAfter: number) {
    super("SkyBlock's share of the Hypixel key is spent");
  }
}

@Injectable()
export class SkyBlockBudgetService {
  public constructor(
    private readonly hypixelService: HypixelService,
    @InjectRedis() private readonly redis: Redis
  ) {}

  public async take() {
    const now = Date.now();
    const rateLimit = await this.hypixelService.getRateLimit();
    if (rateLimit && now < rateLimit.resetAt && rateLimit.remaining - 1 < RESERVE) {
      throw new BudgetError(rateLimit.resetAt - now);
    }

    const window = Math.floor(now / WINDOW);
    const key = `skyblock:budget:${window}`;
    const used = await this.redis.incr(key);
    if (used === 1) await this.redis.expire(key, WINDOW / 1000);

    if (used > HYPIXEL_BUDGET) {
      await this.redis.decr(key);
      throw new BudgetError((window + 1) * WINDOW - now);
    }
  }
}
