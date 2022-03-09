import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { uuid } from 'short-uuid';
import { AuthRole } from './auth.role';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthGuard');

  public constructor(@InjectRedis() private readonly redis: Redis) {}

  public async limited(apiKey: string, weight: number, role: AuthRole): Promise<boolean> {
    const keyInfo = await this.redis.hmget(`key:${apiKey}`, 'role', 'limit');

    if (keyInfo[0] === null || keyInfo[1] === null) throw new UnauthorizedException();

    const [apiKeyRole, apiKeyLimit] = keyInfo.map(Number);

    if (apiKeyRole < role) throw new ForbiddenException();

    const pipeline = this.redis.pipeline();

    const time = Date.now();
    const expirey = 60000;

    const key = `ratelimit:${apiKey}`;

    pipeline.zremrangebyscore(key, 0, time - expirey);
    pipeline.zadd(key, time, `${uuid()}:${weight}`);
    pipeline.zrange(key, 0, -1, 'WITHSCORES');
    pipeline.hincrby(`key:${apiKey}`, 'requests', weight);
    pipeline.expire(key, expirey);

    const [, , requests] = await pipeline.exec();

    if (requests[0]) throw new InternalServerErrorException();

    const weightedTotal = (requests[1] as string[])
      .filter((_, i) => i % 2 === 0)
      .reduce((acc, key) => acc + Number(key.split(':')[1]), 0);

    if (weightedTotal > apiKeyLimit) {
      this.logger.warn(
        `${apiKey} has exceeded their request limit of ${apiKeyLimit} and has requested ${weightedTotal} times`
      );

      throw new HttpException('Too Many Requests', 429);
    }

    return true;
  }
}
