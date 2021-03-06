/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Redis from "ioredis";
import { SimpleIntervalJob, Task } from "toad-scheduler";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Logger } = require("@statsify/logger");
const { MetadataScanner, Player, Guild } = require("@statsify/schemas");

const CONSTRUCTORS = [Player, Guild];

const logger = new Logger("Redis Limiter");
const redis = new Redis(process.env.REDIS_URL);

const limit = async () => {
  for (const constructor of CONSTRUCTORS) {
    const oldLeaderboardPipeline = redis.pipeline();
    const limitLeaderboardPipeline = redis.pipeline();

    const name = constructor.name.toLowerCase();
    const fields = MetadataScanner.scan(constructor);

    fields.forEach(([key, value]) => {
      const path = `${name}.${key}`;
      if (!value.leaderboard.enabled) oldLeaderboardPipeline.del(path);
    });

    await oldLeaderboardPipeline.exec();

    const leaderboards = fields.filter(([, value]) => value.leaderboard.enabled);

    let memberCount = 0;

    leaderboards.forEach(([key, value]) => {
      const path = `${name}.${key}`;
      const { sort, limit } = value.leaderboard;

      if (limit === Number.POSITIVE_INFINITY) return;

      memberCount += limit;

      if (sort === "DESC") {
        limitLeaderboardPipeline.zremrangebyrank(path, 0, -limit);
      } else {
        limitLeaderboardPipeline.zremrangebyrank(path, limit, -1);
      }
    });

    await limitLeaderboardPipeline.exec();

    logger.log(`Limited ${leaderboards.length} ${name} leaderboards`);
    logger.log(
      `There ${memberCount.toLocaleString()} possible members in the ${name} leaderboards`
    );
  }
};

const task = new Task("leaderboard limiting", limit);
const job = new SimpleIntervalJob({ minutes: 10, runImmediately: true }, task);
job.start();
