import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HypixelCache } from '@statsify/api-client';
import { Logger } from '@statsify/logger';
import {
  Friends,
  Gamecounts,
  Guild,
  Player,
  RankedSkyWars,
  RecentGame,
  Status,
  Watchdog,
} from '@statsify/schemas';
import { APIData } from '@statsify/util';
import { catchError, lastValueFrom, map, Observable, of, throwError } from 'rxjs';

@Injectable()
export class HypixelService {
  private readonly logger = new Logger('HypixelService');
  private resources = new Map<string, APIData>();

  public constructor(private readonly httpService: HttpService) {}

  public shouldCache(expirey: number, cache: HypixelCache): boolean {
    return (
      cache !== HypixelCache.LIVE && (cache == HypixelCache.CACHE_ONLY || Date.now() < expirey)
    );
  }

  public getPlayer(tag: string) {
    const url = `/player?${tag.length > 16 ? 'uuid' : 'name'}=${tag}`;

    return lastValueFrom(
      this.request<APIData>(url).pipe(
        map((data) => data.player),
        map((player) => new Player(player)),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        catchError((err) => {
          // console.log(err);
          return of(null);
        })
      )
    );
  }

  public getGuild(tag: string, type: 'name' | 'id' | 'player') {
    const url = `/guild?${type}=${tag}`;
    return lastValueFrom(
      this.request<APIData>(url).pipe(
        map((data) => data.guild),
        map((guild) => new Guild(guild)),
        catchError(() => of(null))
      )
    );
  }

  public getRecentGames(uuid: string): Promise<RecentGame[]> {
    return lastValueFrom(
      this.request<APIData>(`/recentgames?uuid=${uuid}`).pipe(
        map((data) => data.games),
        map((games) => games.map((game: APIData) => new RecentGame(game))),
        catchError(() => of([]))
      )
    );
  }

  public getStatus(uuid: string) {
    return lastValueFrom(
      this.request<APIData>(`/status?uuid=${uuid}`).pipe(
        map((data) => data.session),
        map((status) => new Status(status)),
        catchError(() => of(null))
      )
    );
  }

  public getFriends(uuid: string) {
    return lastValueFrom(
      this.request<APIData>(`/friends?uuid=${uuid}`).pipe(
        map((data) => new Friends(data)),
        catchError(() => of(null))
      )
    );
  }

  public getWatchdog() {
    return lastValueFrom(
      this.request<APIData>('/watchdogstats').pipe(
        map((data) => new Watchdog(data)),
        catchError(() => of(null))
      )
    );
  }

  public getGamecounts() {
    return lastValueFrom(
      this.request<APIData>('/gamecounts').pipe(
        map((data) => data.games),
        map((games) => new Gamecounts(games)),
        catchError(() => of(null))
      )
    );
  }

  public getRankedSkyWars(uuid: string) {
    return lastValueFrom(
      this.request<APIData>(`/player/ranked/skywars?uuid=${uuid}`).pipe(
        map((data) => data.result),
        map((result) => new RankedSkyWars(result)),
        catchError(() => of(null))
      )
    );
  }

  public async getResources(resource: string, forceUpdate = false) {
    if (this.resources.has(resource) && !forceUpdate) return this.resources.get(resource);

    const resource$ = this.request<APIData>(`/resources/${resource}`).pipe(
      map((data) => data),
      catchError(() => of(null))
    );

    const resourceData = await lastValueFrom(resource$);

    if (resourceData) this.resources.set(resource, resourceData);

    return this.resources.get(resource);
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  public updateResources() {
    this.getResources('achievements', true);
    this.getResources('challenges', true);
    this.getResources('quests', true);
  }

  private request<T>(url: string): Observable<T> {
    return this.httpService.get(url).pipe(
      map((res) => res.data),
      catchError((err) => {
        //Ranked SkyWars returns a 404 if the player has not played ranked skywars
        if (!url.includes('/player/ranked/skywars'))
          this.logger.error(`Error requesting ${url}: ${err.message}`);

        return throwError(() => new Error(err.message));
      })
    );
  }
}
