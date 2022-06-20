/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Axios, { AxiosInstance, AxiosRequestHeaders, Method } from 'axios';
import { loadImage } from 'skia-canvas';
import { GuildQuery, HistoricalType } from './enums';
import { LeaderboardQuery } from './enums/leaderboard-query.enum';
import {
  GetFriendsResponse,
  GetGamecountsResponse,
  GetGuildResponse,
  GetHistoricalResponse,
  GetKeyResponse,
  GetPlayerResponse,
  GetRecentGamesResponse,
  GetResourceResponse,
  GetStatusResponse,
  GetUserResponse,
  GetWatchdogResponse,
  PostGuildLeaderboardResponse,
  PostGuildRankingsResponse,
  PostPlayerLeaderboardResponse,
  PostPlayerRankingsResponse,
  PutUserBadgeResponse,
} from './responses';

interface ExtraData {
  headers?: AxiosRequestHeaders;
  body?: Record<string, unknown> | Buffer | string;
}

export class ApiService {
  private axios: AxiosInstance;

  public constructor(private apiRoute: string, private apiKey: string) {
    this.axios = Axios.create({
      baseURL: this.apiRoute,
      headers: {
        'x-api-key': this.apiKey,
      },
      timeout: 10_000,
    });
  }

  public getPlayer(tag: string) {
    return this.requestKey<GetPlayerResponse, 'player'>(`/player`, 'player', {
      player: tag,
    });
  }

  public getRecentGames(tag: string) {
    return this.requestKey<GetRecentGamesResponse, 'recentGames'>(
      `/player/recentgames`,
      'recentGames',
      {
        player: tag,
      }
    );
  }

  public getStatus(tag: string) {
    return this.requestKey<GetStatusResponse, 'status'>(`/player/status`, 'status', {
      player: tag,
    });
  }

  public getFriends(tag: string) {
    return this.requestKey<GetFriendsResponse, 'data'>(`/player/friends`, 'data', {
      player: tag,
    });
  }

  public getPlayerLeaderboard(
    field: string,
    input: string | number,
    type: LeaderboardQuery
  ): Promise<PostPlayerLeaderboardResponse | null> {
    return this.request<PostPlayerLeaderboardResponse>('/player/leaderboards', {}, 'POST', {
      body: {
        field,
        [type]: input,
      },
    });
  }

  public getPlayerRankings(fields: string[], uuid: string) {
    return this.request<PostPlayerRankingsResponse>('/player/leaderboards/rankings', {}, 'POST', {
      body: { fields, uuid },
    });
  }

  public getGuild(tag: string, type: GuildQuery) {
    return this.requestKey<GetGuildResponse, 'guild'>(`/guild`, 'guild', {
      guild: tag,
      type,
    });
  }

  public getGuildLeaderboard(field: string, page: number): Promise<PostGuildLeaderboardResponse>;
  public getGuildLeaderboard(field: string, name: string): Promise<PostGuildLeaderboardResponse>;
  public getGuildLeaderboard(
    field: string,
    pageOrName: number | string
  ): Promise<PostGuildLeaderboardResponse> {
    return this.request<PostGuildLeaderboardResponse>('/guild/leaderboards', {}, 'POST', {
      body: {
        field,
        [typeof pageOrName === 'number' ? 'page' : 'name']: pageOrName,
      },
    });
  }

  public getGuildRanking(fields: string, name: string) {
    return this.request<PostGuildRankingsResponse>('/guild/leaderboards/rankings', {}, 'POST', {
      body: { fields, name },
    });
  }

  public async getWatchdog() {
    return this.requestKey<GetWatchdogResponse, 'watchdog'>(
      `/hypixelresources/watchdog`,
      'watchdog'
    );
  }

  public async getGameCounts() {
    return this.requestKey<GetGamecountsResponse, 'gamecounts'>(
      `/hypixelresources/gamecounts`,
      'gamecounts'
    );
  }

  public async getPlayerHead(uuid: string, size?: number) {
    return this.requestImage(`/skin/head`, { uuid, size });
  }

  public getPlayerSkin(uuid: string) {
    return this.requestImage(`/skin`, { uuid });
  }

  public getPlayerHistorical(tag: string, type: HistoricalType) {
    return this.requestKey<GetHistoricalResponse, 'player'>(`/historical`, 'player', {
      player: tag,
      type,
    });
  }

  public resetPlayerHistorical(tag: string) {
    return this.request<GetPlayerResponse>(`/historical`, { player: tag }, 'DELETE');
  }

  public getKey() {
    return this.requestKey<GetKeyResponse, 'key'>(`/auth/key`, 'key');
  }

  public getUser(tag: string) {
    return this.request<GetUserResponse>(`/user`, { tag })
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  public getUserBadge(tag: string) {
    return this.requestImage(`/user/badge`, { tag }).catch(() => undefined);
  }

  public updateUserBadge(tag: string, badge: Buffer) {
    return this.request<PutUserBadgeResponse>(`user/badge`, { tag }, 'PUT', {
      body: badge,
      headers: { 'Content-Type': 'image/png' },
    });
  }

  public deleteUserBadge(tag: string) {
    return this.request<PutUserBadgeResponse>(`user/badge`, { tag }, 'DELETE');
  }

  public verifyUser(code: string, id: string) {
    return this.request<GetUserResponse>(`/user`, { code, id }, 'PUT')
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  public unverifyUser(tag: string) {
    return this.request<GetUserResponse>(`/user`, { tag }, 'DELETE')
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  public getResource(path: string) {
    return this.request<GetResourceResponse>('/hypixelresources/resource', { path }, 'GET').catch(
      () => null
    );
  }

  private async requestKey<T, K extends keyof T>(
    url: string,
    key: K,
    params?: Record<string, unknown>,
    method: Method = 'GET'
  ) {
    const data = await this.request<T>(url, params, method);

    if (data[key] === undefined || data[key] === null) {
      throw new Error(`Key not found: ${String(key)}`);
    }

    return data[key];
  }

  private async request<T>(
    url: string,
    params: Record<string, unknown> | undefined,
    method: Method = 'GET',
    { body, headers }: ExtraData = {}
  ): Promise<T> {
    const res = await this.axios.request({
      url,
      method,
      params,
      headers,
      data: body,
    });

    const data = res.data;

    if (data.success === false) throw new Error('API request was unsuccessful');

    return data;
  }

  private requestImage(url: string, params?: Record<string, unknown>) {
    return loadImage(this.axios.getUri({ url, params: { key: this.apiKey, ...params } }));
  }
}
