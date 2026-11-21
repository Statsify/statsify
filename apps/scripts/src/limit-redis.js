/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Redis from "ioredis";
import { FULL_SIZE_PLAYER_LEADERBOARDS } from "./full-size-leaderboards.js";
import { GuildSchema, PlayerSchema, getFields } from "@statsify/schemas";
import { Logger } from "@statsify/logger";
import { SimpleIntervalJob, Task } from "toad-scheduler";

const logger = new Logger("Redis Limiter");
const redis = new Redis(process.env.REDIS_URL);

// Player boards outside the list have always been trimmed to a tenth of their limit; lifting it grows Redis up to 10x
const playerLimit = (path, limit) =>
  FULL_SIZE_PLAYER_LEADERBOARDS.has(path) ? limit : Math.floor(limit / 10);

const runLimit = async (schema, getLimit = (path, limit) => limit) => {
  const oldLeaderboardPipeline = redis.pipeline();
  const limitLeaderboardPipeline = redis.pipeline();

  const name = schema.name.toLowerCase();
  const fields = getFields(schema);

  for (const { path, leaderboard } of fields) {
    if (!leaderboard.enabled) oldLeaderboardPipeline.del(`${name}.${path}`);
  }

  await oldLeaderboardPipeline.exec();

  const leaderboards = fields.filter(({ leaderboard }) => leaderboard.enabled);

  let memberCount = 0;

  for (const { path, leaderboard } of leaderboards) {
    const key = `${name}.${path}`;
    const { sort } = leaderboard;
    if (leaderboard.limit === Number.POSITIVE_INFINITY) continue;

    const limit = getLimit(path, leaderboard.limit);
    memberCount += limit;

    if (sort === "DESC") {
      limitLeaderboardPipeline.zremrangebyrank(key, 0, -limit);
    } else {
      limitLeaderboardPipeline.zremrangebyrank(key, limit, -1);
    }
  }

  await limitLeaderboardPipeline.exec();

  logger.log(`Limited ${leaderboards.length} ${name} leaderboards`);
  logger.log(`There are ${memberCount.toLocaleString()} possible members in the ${name} leaderboards`);
};

const limit = async () => {
  await Promise.all([runLimit(PlayerSchema, playerLimit), runLimit(GuildSchema)]);
};

const task = new Task("leaderboard limiting", limit);
const job = new SimpleIntervalJob({ minutes: 10, runImmediately: true }, task);
job.start();
