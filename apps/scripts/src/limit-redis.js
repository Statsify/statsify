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
const HISTORICAL_CONSTRUCTORS = [
  ["DAILY", Player],
  ["WEEKLY", Player],
  ["MONTHLY", Player],
];

const logger = new Logger("Redis Limiter");
const redis = new Redis(process.env.REDIS_URL);

const limitHistorical = async () => {
  for (const [time, constructor] of HISTORICAL_CONSTRUCTORS) {
    const oldLeaderboardPipeline = redis.pipeline();
    const limitLeaderboardPipeline = redis.pipeline();

    const name = constructor.name.toLowerCase();
    const fields = MetadataScanner.scan(constructor);

    fields.forEach(([key, value]) => {
      const path = `${time}:${name}.${key}`;
      if (!value.leaderboard.enabled || !value.leaderboard.historical)
        oldLeaderboardPipeline.del(path);
    });

    await oldLeaderboardPipeline.exec();

    const leaderboards = fields.filter(([, value]) => value.leaderboard.historical);

    let memberCount = 0;

    leaderboards.forEach(([key, value]) => {
      const path = `${name}.${key}`;
      const { sort } = value.leaderboard;
      let { limit } = value.leaderboard;
      if (limit === Number.POSITIVE_INFINITY) return;

      limit /= 10; // Reduce historical leaderboard max size

      memberCount += limit;

      if (sort === "DESC") {
        limitLeaderboardPipeline.zremrangebyrank(path, 0, -limit);
      } else {
        limitLeaderboardPipeline.zremrangebyrank(path, limit, -1);
      }
    });

    await limitLeaderboardPipeline.exec();

    logger.log(`Limited ${leaderboards.length} ${time}:${name} leaderboards`);
    logger.log(
      `There ${memberCount.toLocaleString()} possible members in the ${time}:${name} historical leaderboards`
    );
  }
};

const limitNormal = async () => {
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

const limit = Promise.all.bind(Promise, [await limitNormal(), await limitHistorical()]);

const task = new Task("leaderboard limiting", limit);
const job = new SimpleIntervalJob({ minutes: 10, runImmediately: true }, task);
job.start();
