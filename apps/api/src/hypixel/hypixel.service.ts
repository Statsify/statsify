import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Logger } from '@statsify/logger';
import { Guild, Player } from '@statsify/schemas';
import { APIData } from '@statsify/util';
import { catchError, lastValueFrom, map, Observable, of, throwError } from 'rxjs';

@Injectable()
export class HypixelService {
  private readonly logger = new Logger('HypixelService');

  public constructor(private readonly httpService: HttpService) {}

  public getPlayer(tag: string) {
    const url = `/player?${tag.length > 16 ? 'uuid' : 'name'}=${tag}`;

    return lastValueFrom(
      this.request<APIData>(url).pipe(
        map((data) => data.player),
        map((player) => new Player(player)),
        catchError((err) => {
          this.logger.error(`Error getting player ${tag}: ${err.message}`);
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
        catchError((err) => {
          this.logger.error(`Error getting guild ${tag} with ${type}: ${err.message}`);
          return of(null);
        })
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
