import Redis from 'ioredis';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { Logger } = require('@statsify/logger');
const { MetadataScanner, Player } = require('@statsify/schemas');

const logger = new Logger('Redis Limiter');

const redis = new Redis(process.env.REDIS_URL);

const oldLeaderboardPipeline = redis.pipeline();
const limitLeaderboardPipeline = redis.pipeline();

const fields = MetadataScanner.scan(Player);

fields.forEach(([key, value]) => {
  const path = `${Player.name.toLowerCase()}.${key}`;
  if (!value.leaderboard.enabled) oldLeaderboardPipeline.del(path);
});

await oldLeaderboardPipeline.exec();

const leaderboards = fields.filter(([, value]) => value.leaderboard.enabled);

leaderboards.forEach(([key, value]) => {
  const path = `${Player.name.toLowerCase()}.${key}`;
  const { sort, limit } = value.leaderboard;

  logger.debug(`Limiting ${path} to ${limit.toLocaleString()} members`);

  if (sort === 'DESC') {
    limitLeaderboardPipeline.zremrangebyrank(path, 0, -limit);
  } else {
    limitLeaderboardPipeline.zremrangebyrank(path, limit, -1);
  }
});

await limitLeaderboardPipeline.exec();

logger.log(`Limited ${leaderboards.length} leaderboards`);
process.exit(0);
