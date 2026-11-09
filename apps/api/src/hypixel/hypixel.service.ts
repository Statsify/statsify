/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

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
import { Injectable } from "@nestjs/common";
import {
  Observable,
  type OperatorFunction,
  catchError,
  lastValueFrom,
  map,
  of,
  tap,
  throwError,
} from "rxjs";
import {
  addRequestAttributes,
  getRequestAttributes,
  setRequestAttributes,
  setRequestError,
} from "@statsify/logger";
import type { APIData } from "@statsify/util";

const recover = <T, F>(fallback: F): OperatorFunction<T, T | F> =>
  catchError((error) => {
    const status: number | undefined = error.cause?.response?.status;

    setRequestError(error, {
      code: status,
      retryable: error.cause !== undefined && (status === undefined || status === 429 || status >= 500),
    });

    return of(fallback);
  });

@Injectable()
export class HypixelService {
  private resources = new Map<string, APIData>();

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
        recover(null)
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
        recover(null)
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
        recover([])
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
        recover(null)
      )
    );
  }

  public getWatchdog() {
    return lastValueFrom(
      this.request<APIData>("/watchdogstats").pipe(
        map((data) => new Watchdog(data)),
        recover(null)
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
        recover(null)
      )
    );
  }

  public async getResources(resource: string, forceUpdate = false) {
    if (this.resources.has(resource) && !forceUpdate) return this.resources.get(resource);

    const resource$ = this.request<APIData>(`/resources/${resource}`).pipe(
      map((data) => data),
      recover(null)
    );

    const resourceData = await lastValueFrom(resource$);

    if (resourceData) this.resources.set(resource, resourceData);

    return this.resources.get(resource);
  }

  private request<T>(url: string, params?: Record<string, unknown>): Observable<T> {
    const start = performance.now();

    return this.httpService.get(url, { params }).pipe(
      tap({
        next: (res) => this.recordRequest(start, res.status, res.headers["ratelimit-remaining"]),
        error: (err) => this.recordRequest(start, err.response?.status, err.response?.headers["ratelimit-remaining"]),
      }),
      map((res) => res.data),
      catchError((err) =>
        throwError(
          () =>
            new Error(`Fetching ${url} failed with reason: ${err.message}`, {
              cause: err,
            })
        )
      )
    );
  }

  private recordRequest(start: number, status?: number, rateLimitRemaining?: string) {
    addRequestAttributes({
      "hypixel.request.count": 1,
      "hypixel.request.duration_ms": Math.round(performance.now() - start),
    });

    if (status === undefined) return;

    const { "hypixel.response.status_codes": statuses } = getRequestAttributes();

    setRequestAttributes({
      "hypixel.response.status_codes": statuses ? `${statuses},${status}` : `${status}`,
      ...(rateLimitRemaining !== undefined && { "hypixel.ratelimit.remaining": Number(rateLimitRemaining) }),
    });
  }
}
