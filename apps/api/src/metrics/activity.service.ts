/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { InjectRedis } from "#redis";
import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";

const DAY_IN_SECONDS = 60 * 60 * 24;
const RETENTION_DAYS = 90;

@Injectable()
export class ActivityService {
  public constructor(@InjectRedis() private readonly redis: Redis) {}

  public async recordActive(userId?: string) {
    if (!userId) return;

    const key = ActivityService.dayKey();

    await this.redis.pfadd(key, userId);
    await this.redis.expire(key, DAY_IN_SECONDS * RETENTION_DAYS, "NX");
  }

  public async getActiveUsers(days: number): Promise<number> {
    const keys = Array.from({ length: days }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);

      return ActivityService.dayKey(date);
    });

    return this.redis.pfcount(...keys);
  }

  public async getMetrics() {
    const [dau, wau, mau] = await Promise.all([
      this.getActiveUsers(1),
      this.getActiveUsers(7),
      this.getActiveUsers(30),
    ]);

    return { dau, wau, mau, stickiness: mau ? dau / mau : 0 };
  }

  private static dayKey(d = new Date()): string {
    return `hll:active:d:${d.toISOString().slice(0, 10)}`;
  }
}
