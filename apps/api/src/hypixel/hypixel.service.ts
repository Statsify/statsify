/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { CacheLevel, HypixelUnavailableException } from "@statsify/api-client";
import {
  GameCounts,
  Guild,
  Player,
  RecentGame,
  Status,
  Watchdog,
} from "@statsify/schemas";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { Observable, catchError, lastValueFrom, map, of, tap, throwError } from "rxjs";
import type { APIData } from "@statsify/util";

const DEFAULT_RATE_LIMIT_SECONDS = 60;

const parseHeader = (value: unknown) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

@Injectable()
export class HypixelService {
  private readonly logger = new Logger("HypixelService");
  private resources = new Map<string, APIData>();
  private rateLimitedUntil = 0;

  public constructor(private readonly httpService: HttpService) {}

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
        catchError((err) => this.handleFailure(err, null))
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
        catchError((err) => this.handleFailure(err, null))
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
        catchError((err) => this.handleFailure(err, []))
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
        catchError((err) => this.handleFailure(err, null))
      )
    );
  }

  public getWatchdog() {
    return lastValueFrom(
      this.request<APIData>("/watchdogstats").pipe(
        map((data) => new Watchdog(data)),
        catchError((err) => {
          if (!(err instanceof HypixelUnavailableException)) this.logger.error(err);
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
          if (!(err instanceof HypixelUnavailableException)) this.logger.error(err);
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

  private handleFailure<T>(err: any, notFound: T): Observable<T> {
    if (err instanceof HypixelUnavailableException) return throwError(() => err);

    this.logger.error(err);

    // Hypixel rejecting the input means there is nothing to find
    const status = err.cause?.response?.status;
    if (status === 400 || status === 422) return of(notFound);

    return throwError(() => new HypixelUnavailableException());
  }

  private startRateLimit(headers: Record<string, unknown>) {
    const seconds =
      parseHeader(headers["ratelimit-reset"]) ??
      parseHeader(headers["retry-after"]) ??
      DEFAULT_RATE_LIMIT_SECONDS;

    const wasRateLimited = Date.now() < this.rateLimitedUntil;
    this.rateLimitedUntil = Math.max(this.rateLimitedUntil, Date.now() + seconds * 1000);

    if (!wasRateLimited) {
      this.logger.warn(`Hypixel is rate limiting requests for the next ${seconds} seconds`);
    }
  }

  private rateLimitError() {
    const seconds = Math.ceil((this.rateLimitedUntil - Date.now()) / 1000);
    return new HypixelUnavailableException(Math.max(1, seconds));
  }

  private request<T>(url: string, params?: Record<string, unknown>): Observable<T> {
    // Resources don't need an API key, so the key's rate limit doesn't apply to them
    const isKeyed = !url.startsWith("/resources/");

    if (isKeyed && Date.now() < this.rateLimitedUntil) {
      return throwError(() => this.rateLimitError());
    }

    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "http.client",
      description: `GET ${this.httpService.axiosRef.getUri({ url })}`,
    });

    return this.httpService.get(url, { params }).pipe(
      tap((res) => {
        child?.setHttpStatus(res.status);
        child?.finish();

        if (isKeyed && parseHeader(res.headers["ratelimit-remaining"]) === 0) {
          this.startRateLimit(res.headers);
        }
      }),
      map((res) => res.data),
      catchError((err) => {
        if (isKeyed && (err.response?.status === 429 || err.response?.data?.throttle)) {
          this.startRateLimit(err.response.headers);
          return throwError(() => this.rateLimitError());
        }

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
