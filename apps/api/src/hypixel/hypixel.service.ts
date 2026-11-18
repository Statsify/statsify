/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { CacheLevel } from "@statsify/api-client";
import {
  GameCounts,
  Guild,
  Player,
  RecentGame,
  Status,
  Watchdog,
} from "@statsify/schemas";
import { HttpService } from "@nestjs/axios";
import { InjectRedis } from "#redis";
import { Injectable } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { Observable, catchError, lastValueFrom, map, of, tap, throwError } from "rxjs";
import { Redis } from "ioredis";
import { type APIData, config } from "@statsify/util";
import type { RawMuseum, RawProfile } from "@statsify/skyblock";
import type { Span } from "@sentry/node";

const RATE_LIMIT_KEY = "hypixel:ratelimit";

// A large co-op's profiles response runs to several MB, more than the default timeout allows.
export const SKYBLOCK_TIMEOUT = await config("skyblock.timeout", { default: 10_000 });

/** Hypixel's 5-minute window starts at the key's first call; times are epoch ms. */
export interface RateLimit {
  limit: number;
  remaining: number;
  resetAt: number;
  at: number;
}

export class HypixelUnavailableError extends Error {
  public constructor(cause: unknown) {
    super(`Hypixel did not answer (${String(cause)})`, { cause });
  }
}

export class HypixelThrottledError extends Error {
  public constructor(
    public readonly retryAfter: number | undefined,
    global: boolean
  ) {
    super(global ? "Hypixel throttled every key" : "Hypixel throttled the key");
  }
}

function toSkyBlockError(error: Error) {
  const { response } = (error.cause ?? {}) as {
    response?: { status: number; headers: Record<string, unknown>; data?: { global?: boolean } };
  };
  if (response?.status !== 429) return new HypixelUnavailableError(error);

  const reset = Number(response.headers["ratelimit-reset"]);
  return new HypixelThrottledError(Number.isNaN(reset) ? undefined : reset * 1000, response.data?.global === true);
}

@Injectable()
export class HypixelService {
  private readonly logger = new Logger("HypixelService");
  private resources = new Map<string, APIData>();
  private rateLimit?: RateLimit;

  public constructor(
    private readonly httpService: HttpService,
    @InjectRedis() private readonly redis: Redis
  ) {}

  public shouldCache(expirey: number, cache: CacheLevel): boolean {
    return (
      cache !== CacheLevel.LIVE &&
      (cache === CacheLevel.CACHE_ONLY || Date.now() < expirey)
    );
  }

  public getPlayer(tag: string) {
    return lastValueFrom(
      this.request<APIData>("/player", { [tag.length > 16 ? "uuid" : "name"]: tag }).pipe(
        map((data) => {
          if (data.player) return new Player(data.player);
          return null;
        }),
        catchError((err) => {
          this.logger.error(err);
          return of(null);
        })
      )
    );
  }

  public getGuild(tag: string, type: "name" | "id" | "player") {
    return lastValueFrom(
      this.request<APIData>("/guild", { [type]: tag }).pipe(
        map((data) => {
          if (data.guild) return new Guild(data.guild);
          return null;
        }),
        catchError((err) => {
          this.logger.error(err);
          return of(null);
        })
      )
    );
  }

  public getRecentGames(uuid: string): Promise<RecentGame[]> {
    return lastValueFrom(
      this.request<APIData>("/recentgames", { uuid }).pipe(
        map((data) => {
          if (data.games) return data.games.map((game: APIData) => new RecentGame(game));
          return [];
        }),
        catchError((err) => {
          this.logger.error(err);
          return of([]);
        })
      )
    );
  }

  public getStatus(uuid: string) {
    return lastValueFrom(
      this.request<APIData>("/status", { uuid }).pipe(
        map((data) => {
          if (data.session) return new Status(data.session);
          return null;
        }),
        catchError((err) => {
          this.logger.error(err);
          return of(null);
        })
      )
    );
  }

  public getWatchdog() {
    return lastValueFrom(
      this.request<APIData>("/watchdogstats").pipe(
        map((data) => new Watchdog(data)),
        catchError((err) => {
          this.logger.error(err);
          return of(null);
        })
      )
    );
  }

  public getGameCounts() {
    return lastValueFrom(
      this.request<APIData>("/gamecounts").pipe(
        map((data) => {
          if (data.games) return new GameCounts(data.games);
          return null;
        }),
        catchError((err) => {
          this.logger.error(err);
          return of(null);
        })
      )
    );
  }

  public async getResources(resource: string, forceUpdate = false) {
    if (this.resources.has(resource) && !forceUpdate) return this.resources.get(resource);

    const resource$ = this.request<APIData>(`/resources/${resource}`).pipe(
      map((data) => data),
      catchError((err) => {
        this.logger.error(err);
        return of(null);
      })
    );

    const resourceData = await lastValueFrom(resource$);

    if (resourceData) this.resources.set(resource, resourceData);

    return this.resources.get(resource);
  }

  /** null when the player never played SkyBlock. */
  public getSkyBlockProfiles(uuid: string): Promise<RawProfile[] | null> {
    return lastValueFrom(
      this.request<{ profiles?: RawProfile[] | null }>("/v2/skyblock/profiles", { uuid }, SKYBLOCK_TIMEOUT).pipe(
        map((data) => data.profiles ?? null),
        catchError((error) => throwError(() => toSkyBlockError(error)))
      )
    );
  }

  public getSkyBlockMuseum(profileId: string): Promise<RawMuseum> {
    return lastValueFrom(
      this.request<RawMuseum>("/v2/skyblock/museum", { profile: profileId }, SKYBLOCK_TIMEOUT).pipe(
        map(({ members }) => ({ members })),
        catchError((error) => throwError(() => toSkyBlockError(error)))
      )
    );
  }

  public async getRateLimit(): Promise<RateLimit | undefined> {
    const stored = await this.redis.hgetall(RATE_LIMIT_KEY);
    const shared = stored.at
      ? {
        limit: Number(stored.limit),
        remaining: Number(stored.remaining),
        resetAt: Number(stored.resetAt),
        at: Number(stored.at),
      }
      : undefined;

    if (!shared || !this.rateLimit) return shared ?? this.rateLimit;
    return shared.at > this.rateLimit.at ? shared : this.rateLimit;
  }

  /** Keeps the key's latest RateLimit-* headers, so the SkyBlock budget sees what every caller spent. */
  private recordRateLimit(headers: Record<string, unknown> | undefined, span: Span | undefined) {
    const [limit, remaining, reset] = ["limit", "remaining", "reset"].map((name) => Number(headers?.[`ratelimit-${name}`]));

    if ([limit, remaining, reset].some(Number.isNaN)) return;

    const at = Date.now();
    const rateLimit = { limit, remaining, resetAt: at + reset * 1000, at };
    this.rateLimit = rateLimit;
    span?.setTag("hypixel.ratelimit.remaining", remaining);

    this.redis
      .pipeline()
      .hset(RATE_LIMIT_KEY, rateLimit)
      .pexpireat(RATE_LIMIT_KEY, rateLimit.resetAt)
      .exec()
      .catch((error) => this.logger.error(error));
  }

  private request<T>(url: string, params?: Record<string, unknown>, timeout?: number): Observable<T> {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "http.client",
      description: `GET ${this.httpService.axiosRef.getUri({ url })}`,
    });

    return this.httpService.get(url, { params, timeout }).pipe(
      tap((res) => {
        this.recordRateLimit(res.headers, child);
        child?.setHttpStatus(res.status);
        child?.finish();
      }),
      map((res) => res.data),
      catchError((err) => {
        this.recordRateLimit(err.response?.headers, child);

        return throwError(
          () =>
            new Error(`Fetching ${url} failed with reason: ${err.message}`, {
              cause: err,
            })
        );
      })
    );
  }
}
