import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Logger } from '@statsify/logger';
import { Friends, Guild, Player, RecentGame, Status } from '@statsify/schemas';
import { APIData } from '@statsify/util';
import { catchError, lastValueFrom, map, Observable, of, throwError } from 'rxjs';
import { HypixelCache } from './cache.enum';

@Injectable()
export class HypixelService {
  private readonly logger = new Logger('HypixelService');

  public constructor(private readonly httpService: HttpService) {}

  public shouldCache(expirey: number, cache: HypixelCache): boolean {
    return (
      cache !== HypixelCache.LIVE && (cache == HypixelCache.CACHE_ONLY || expirey > Date.now())
    );
  }

  public getPlayer(tag: string) {
    const url = `/player?${tag.length > 16 ? 'uuid' : 'name'}=${tag}`;

    return lastValueFrom(
      this.request<APIData>(url).pipe(
        map((data) => data.player),
        map((player) => new Player(player)),
        catchError(() => of(null))
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

  private request<T>(url: string): Observable<T> {
    return this.httpService.get(url).pipe(
      map((res) => res.data),
      catchError((err) => {
        this.logger.error(`Error requesting ${url}: ${err.message}`);

        return throwError(() => new Error(err.message));
      })
    );
  }
}
