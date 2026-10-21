/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Redis from "ioredis";
import { Guild, scanMetadata, Player } from "@statsify/schemas";
import { Logger } from "@statsify/logger";
import { SimpleIntervalJob, Task } from "toad-scheduler";

const logger = new Logger("Redis Limiter");
const redis = new Redis(process.env.REDIS_URL);

const limit = async () => {
  for (const constructor of [Player, Guild]) {
    const oldLeaderboardPipeline = redis.pipeline();
    const limitLeaderboardPipeline = redis.pipeline();

    const name = constructor.name.toLowerCase();
    const fields = scanMetadata(constructor);

    for (const [key, value] of fields) {
      if (!value.leaderboard.enabled) oldLeaderboardPipeline.del(`${name}.${key}`);
    }

    // oxlint-disable-next-line no-await-in-loop
    await oldLeaderboardPipeline.exec();

    const leaderboards = fields.filter(([, value]) => value.leaderboard.enabled);

    let memberCount = 0;

    for (const [key, value] of leaderboards) {
      const path = `${name}.${key}`;
      const { sort, limit } = value.leaderboard;
      if (limit === Number.POSITIVE_INFINITY) continue;

      memberCount += limit;

      // Both ends of the range are removed, so these keep exactly `limit` members
      if (sort === "DESC") {
        limitLeaderboardPipeline.zremrangebyrank(path, 0, -(limit + 1));
      } else {
        limitLeaderboardPipeline.zremrangebyrank(path, limit, -1);
      }
    }

    // oxlint-disable-next-line no-await-in-loop
    await limitLeaderboardPipeline.exec();

    logger.log(`Limited ${leaderboards.length} ${name} leaderboards`);
    logger.log(`There are ${memberCount.toLocaleString()} possible members in the ${name} leaderboards`);
  }
};

const task = new Task("leaderboard limiting", limit);
const job = new SimpleIntervalJob({ minutes: 10, runImmediately: true }, task);
job.start();
