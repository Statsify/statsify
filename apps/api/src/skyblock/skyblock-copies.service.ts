/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HypixelUnavailableError } from "#hypixel";
import { InjectRedis } from "#redis";
import { Injectable } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { Redis } from "ioredis";
import { gunzipJson, gzipJson } from "./zip.js";

export const FAILURE_BACKOFF_MS = 60_000;

export const getFailureKey = (key: string) => `skyblock:failed:${key}`;

export interface Copy<T> {
  value: T;
  fetchedAt: number;
}

@Injectable()
export class SkyBlockCopiesService {
  private readonly logger = new Logger("SkyBlockCopiesService");

  public constructor(@InjectRedis() private readonly redis: Redis) {}

  // An outdated copy waits for the refetch, and stays if the refetch fails.
  public async get<T>(
    key: string,
    maxAgeMs: number,
    fetch: () => Promise<T>,
    last?: Copy<T>,
    isOutdated: (copy: Copy<T>) => boolean = () => false,
  ): Promise<Copy<T> | undefined> {
    const isCurrent = (copy: Copy<T> | undefined) =>
      copy !== undefined &&
      Date.now() - copy.fetchedAt <= maxAgeMs &&
      !isOutdated(copy);

    let copy = last;
    if (!isCurrent(copy)) {
      copy = (await this.readStored<T>(key, copy?.fetchedAt)) ?? copy;
    }

    if (isCurrent(copy)) return copy;
    if (await this.redis.exists(getFailureKey(key))) return copy;

    // Only a failed request backs off, not a failed write to Redis.
    const refetch = fetch().then(
      async (value) => {
        const fetched = { value, fetchedAt: Date.now() };
        await this.store(key, fetched);
        return fetched;
      },
      async (error) => {
        await this.redis.set(getFailureKey(key), "1", "PX", FAILURE_BACKOFF_MS);
        throw error;
      },
    );

    // A stale copy answers at once, since a Hypixel timeout outlasts the bot's.
    if (copy && !isOutdated(copy)) {
      void refetch.catch((error) => this.logger.error(error));
      return copy;
    }

    try {
      return await refetch;
    } catch (error) {
      if (!(error instanceof HypixelUnavailableError)) throw error;

      this.logger.error(error);
      return copy;
    }
  }

  private async readStored<T>(
    key: string,
    since = 0,
  ): Promise<Copy<T> | undefined> {
    const [data, storedAt] = await this.redis.hmgetBuffer(
      key,
      "data",
      "fetchedAt",
    );
    const fetchedAt = Number(storedAt?.toString());
    if (!data || !(fetchedAt > since)) return;

    return { value: await gunzipJson<T>(data), fetchedAt };
  }

  private async store<T>(key: string, { value, fetchedAt }: Copy<T>) {
    await this.redis.hset(key, { data: await gzipJson(value), fetchedAt });
  }
}
