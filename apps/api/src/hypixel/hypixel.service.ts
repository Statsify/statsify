/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { APIData } from "@statsify/util";
import {
  Friends,
  GameCounts,
  Guild,
  Player,
  RecentGame,
  Status,
  Watchdog,
} from "@statsify/schemas";
import { HttpService } from "@nestjs/axios";
import { HypixelCache } from "@statsify/api-client";
import { Injectable } from "@nestjs/common";
import { Logger } from "@statsify/logger";
import { Observable, catchError, lastValueFrom, map, of, tap, throwError } from "rxjs";

@Injectable()
export class HypixelService {
  private readonly logger = new Logger("HypixelService");
  private resources = new Map<string, APIData>();

  public constructor(private readonly httpService: HttpService) {}

  public shouldCache(expirey: number, cache: HypixelCache): boolean {
    return (
      cache !== HypixelCache.LIVE &&
      (cache == HypixelCache.CACHE_ONLY || Date.now() < expirey)
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
      this.request<APIData>(`/recentgames`, { uuid }).pipe(
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
      this.request<APIData>(`/status`, { uuid }).pipe(
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

  public getFriends(uuid: string) {
    return lastValueFrom(
      this.httpService
        .get(`/friends/${uuid}`, { baseURL: "https://api.sk1er.club" })
        .pipe(
          map((data) => new Friends(data.data)),
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

  private request<T>(url: string, params?: Record<string, unknown>): Observable<T> {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "http.client",
      description: `GET ${this.httpService.axiosRef.getUri({ url })}`,
    });

    return this.httpService.get(url, { params }).pipe(
      tap((res) => {
        child?.setHttpStatus(res.status);
        child?.finish();
      }),
      map((res) => res.data),
      catchError((err) => {
        this.logger.error(err);
        return throwError(() => err);
      })
    );
  }
}
