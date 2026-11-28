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
import { Injectable } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { Observable, catchError, lastValueFrom, map, of, tap, throwError } from "rxjs";
import type { APIData } from "@statsify/util";
import type {
  RawBazaar,
  RawGarden,
  RawItemsResource,
  RawMuseum,
  RawProfile,
} from "@statsify/skyblock";

// A big co-op's profiles run to several MB, past the default timeout.
export const SKYBLOCK_TIMEOUT_MS = 10_000;

// Axios leaves out a null header, so this drops the module's API-Key.
const KEYLESS_HEADERS = { "API-Key": null };

export class HypixelUnavailableError extends Error {}

export class HypixelThrottledError extends HypixelUnavailableError {
  public constructor(
    public readonly retryAfter: number | undefined,
    global: boolean
  ) {
    super(global ? "Hypixel throttled every key" : "Hypixel throttled the key");
  }
}

function getErrorResponse(error: Error) {
  const { response } = (error.cause ?? {}) as {
    response?: {
      status: number;
      headers: Record<string, unknown>;
      data?: { global?: boolean };
    };
  };
  return response;
}

function toSkyBlockError(error: Error) {
  const response = getErrorResponse(error);
  if (response?.status !== 429) {
    const message = `Hypixel did not answer (${String(error)})`;
    return new HypixelUnavailableError(message, { cause: error });
  }

  const reset = Number(response.headers["ratelimit-reset"]);
  const retryAfter = Number.isNaN(reset) ? undefined : reset * 1000;
  return new HypixelThrottledError(retryAfter, response.data?.global === true);
}

@Injectable()
export class HypixelService {
  private readonly logger = new Logger("HypixelService");
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

  public async getSkyBlockProfiles(uuid: string) {
    const { profiles } = await this.getSkyBlock<{ profiles?: RawProfile[] | null }>(
      "/v2/skyblock/profiles",
      { params: { uuid } }
    );

    return profiles ?? null;
  }

  public getSkyBlockMuseum(profileId: string) {
    return this.getSkyBlock<RawMuseum>("/v2/skyblock/museum", {
      params: { profile: profileId },
    });
  }

  // Hypixel answers a profile with no Garden with a 404.
  public getSkyBlockGarden(profileId: string) {
    const request = this.request<{ garden: RawGarden }>(
      "/v2/skyblock/garden",
      { profile: profileId },
      { timeout: SKYBLOCK_TIMEOUT_MS }
    );

    return lastValueFrom(
      request.pipe(
        map(({ garden }) => garden),
        catchError((error) =>
          getErrorResponse(error)?.status === 404
            ? of(null)
            : throwError(() => toSkyBlockError(error))
        )
      )
    );
  }

  public getSkyBlockBazaar() {
    return this.getSkyBlock<RawBazaar>("/v2/skyblock/bazaar", { keyless: true });
  }

  public getSkyBlockItems() {
    return this.getSkyBlock<RawItemsResource>("/v2/resources/skyblock/items", {
      keyless: true,
    });
  }

  private getSkyBlock<T>(
    url: string,
    { params, keyless }: { params?: Record<string, unknown>; keyless?: boolean } = {}
  ) {
    return lastValueFrom(
      this.request<T>(url, params, { timeout: SKYBLOCK_TIMEOUT_MS, keyless }).pipe(
        catchError((error) => throwError(() => toSkyBlockError(error)))
      )
    );
  }

  private request<T>(
    url: string,
    params?: Record<string, unknown>,
    { timeout, keyless }: { timeout?: number; keyless?: boolean } = {}
  ): Observable<T> {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "http.client",
      description: `GET ${this.httpService.axiosRef.getUri({ url })}`,
    });

    const headers = keyless ? KEYLESS_HEADERS : undefined;
    return this.httpService.get(url, { params, timeout, headers }).pipe(
      tap((res) => {
        child?.setHttpStatus(res.status);
        child?.finish();
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
}
